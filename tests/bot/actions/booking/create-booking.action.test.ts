import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { CreateBookingAction } from '../../../../src/bot/actions/booking/create-booking.action';
import { SlotConflictException } from '../../../../src/bot/exceptions/slot-conflict.exception';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { User } from '../../../../src/generated/prisma';

const FUTURE_DATE_AND_TIME = dayjs.utc('2026-05-15T10:00:00Z');
const PAST_DATE_AND_TIME = dayjs.utc('2020-01-01T10:00:00Z');
const SELECTED_DURATION = 60;

const fakeUser: User = {
  id: 7,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Test',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeAction() {
  const bookingService = {
    getByDate: vi.fn().mockResolvedValue([]),
    createIfAvailable: vi.fn().mockResolvedValue({ id: 100 }),
  };
  const bookingSlotService = {
    generateAvailableDurations: vi.fn().mockReturnValue([30, SELECTED_DURATION, 90]),
  };
  const showChooseCourtAction = { run: vi.fn().mockResolvedValue(true) };

  const action = new CreateBookingAction(
    bookingService as any,
    bookingSlotService as any,
    showChooseCourtAction as any,
  );

  return { action, bookingService, bookingSlotService, showChooseCourtAction };
}

function ctxWithDuration(overrides?: { dateAndTime?: dayjs.Dayjs; courtId?: number }) {
  return createMockContext({
    user: fakeUser,
    session: {
      sessionStartsAt: new Date(),
      bookingData: {
        courtId: overrides?.courtId ?? 1,
        dateAndTime: overrides?.dateAndTime ?? FUTURE_DATE_AND_TIME,
      },
    },
  });
}

describe('CreateBookingAction', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('session data validation', () => {
    it('replies with error and redirects when courtId is missing', async () => {
      const { action, showChooseCourtAction } = makeAction();
      const ctx = createMockContext({
        user: fakeUser,
        session: { sessionStartsAt: new Date(), bookingData: { dateAndTime: FUTURE_DATE_AND_TIME } },
      });

      await action.run(ctx, SELECTED_DURATION);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('replies with error and redirects when dateAndTime is missing', async () => {
      const { action, showChooseCourtAction } = makeAction();
      const ctx = createMockContext({
        user: fakeUser,
        session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } },
      });

      await action.run(ctx, SELECTED_DURATION);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('does not create booking when session data is missing', async () => {
      const { action, bookingService } = makeAction();
      const ctx = createMockContext({
        session: { sessionStartsAt: new Date(), bookingData: {} },
      });

      await action.run(ctx, SELECTED_DURATION);

      expect(bookingService.createIfAvailable).not.toHaveBeenCalled();
    });
  });

  describe('duration validation', () => {
    it('replies with error and redirects when dateAndTime is in the past', async () => {
      const { action, showChooseCourtAction } = makeAction();
      const ctx = ctxWithDuration({ dateAndTime: PAST_DATE_AND_TIME });

      await action.run(ctx, SELECTED_DURATION);

      expect(ctx.reply).toHaveBeenCalledWith('errors.cannot_create_booking_with_selected_parameters');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('replies with error and redirects when selectedDuration is null', async () => {
      const { action, showChooseCourtAction } = makeAction();
      const ctx = ctxWithDuration();

      await action.run(ctx, null);

      expect(ctx.reply).toHaveBeenCalledWith('errors.cannot_create_booking_with_selected_parameters');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('replies with error and redirects when duration is not in available list', async () => {
      const { action, bookingSlotService, showChooseCourtAction } = makeAction();
      bookingSlotService.generateAvailableDurations.mockReturnValue([30]);
      const ctx = ctxWithDuration();

      await action.run(ctx, SELECTED_DURATION);

      expect(ctx.reply).toHaveBeenCalledWith('errors.cannot_create_booking_with_selected_parameters');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('does not create booking when duration is invalid', async () => {
      const { action, bookingService } = makeAction();
      const ctx = ctxWithDuration({ dateAndTime: PAST_DATE_AND_TIME });

      await action.run(ctx, SELECTED_DURATION);

      expect(bookingService.createIfAvailable).not.toHaveBeenCalled();
    });
  });

  describe('booking creation', () => {
    it('creates booking with correct arguments', async () => {
      const { action, bookingService } = makeAction();
      const ctx = ctxWithDuration();

      await action.run(ctx, SELECTED_DURATION);

      expect(bookingService.createIfAvailable).toHaveBeenCalledWith(
        1,
        fakeUser.id,
        FUTURE_DATE_AND_TIME.toDate(),
        FUTURE_DATE_AND_TIME.add(SELECTED_DURATION, 'minute').toDate(),
      );
    });

    it('shows error and redirects when slot is concurrently taken', async () => {
      const { action, bookingService, showChooseCourtAction } = makeAction();
      bookingService.createIfAvailable.mockRejectedValue(new SlotConflictException());
      const ctx = ctxWithDuration();

      await action.run(ctx, SELECTED_DURATION);

      expect(ctx.reply).toHaveBeenCalledWith('errors.cannot_create_booking_with_selected_parameters');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('rethrows unexpected errors', async () => {
      const { action, bookingService } = makeAction();
      const unexpected = new Error('db connection lost');
      bookingService.createIfAvailable.mockRejectedValue(unexpected);
      const ctx = ctxWithDuration();

      await expect(action.run(ctx, SELECTED_DURATION)).rejects.toThrow('db connection lost');
    });

    it('clears session bookingData after successful creation', async () => {
      const { action } = makeAction();
      const ctx = ctxWithDuration();

      await action.run(ctx, SELECTED_DURATION);

      expect(ctx.session.bookingData).toEqual({});
    });

    it('calls editMessageText with booking_created confirmation', async () => {
      const { action } = makeAction();
      const ctx = ctxWithDuration();

      await action.run(ctx, SELECTED_DURATION);

      expect(ctx.editMessageText).toHaveBeenCalledOnce();
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('booking_created');
    });
  });
});
