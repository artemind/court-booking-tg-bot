import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ChooseDurationHandler } from '../../../../src/bot/handlers/booking/choose-duration.handler';
import { ContextManager } from '../../../../src/bot/context.manager';
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

function makeHandler() {
  const actions: Array<{ pattern: string | RegExp; cb: Function }> = [];
  const bot = { action: vi.fn((p, cb) => actions.push({ pattern: p, cb })) };

  const bookingService = {
    getByDate: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 100 }),
  };
  const bookingSlotService = {
    generateAvailableDurations: vi.fn().mockReturnValue([30, SELECTED_DURATION, 90]),
  };
  const showChooseCourtAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseTimeAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ChooseDurationHandler(
    bot as any,
    bookingService as any,
    bookingSlotService as any,
    showChooseCourtAction as any,
    showChooseTimeAction as any,
  );

  const backCb = () => actions[0]!.cb;
  const selectCb = () => actions[1]!.cb;

  return { handler, bot, bookingService, bookingSlotService, showChooseCourtAction, showChooseTimeAction, backCb, selectCb };
}

function ctxWithDuration(duration: string, overrides?: { dateAndTime?: dayjs.Dayjs; courtId?: number }) {
  const dateAndTime = overrides?.dateAndTime ?? FUTURE_DATE_AND_TIME;
  const courtId = overrides?.courtId ?? 1;
  return createMockContext({
    user: fakeUser,
    match: ['', duration] as unknown as RegExpExecArray,
    session: {
      sessionStartsAt: new Date(),
      bookingData: { courtId, dateAndTime },
    },
  });
}

describe('ChooseDurationHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('BOOKING_CHOOSE_DURATION_BACK', () => {
    it('clears time selection via ContextManager', async () => {
      const { handler, backCb } = makeHandler();
      await handler.register();
      const spy = vi.spyOn(ContextManager, 'clearTimeSelection');
      const ctx = createMockContext();

      await backCb()(ctx);

      expect(spy).toHaveBeenCalledWith(ctx);
    });

    it('navigates to time selection', async () => {
      const { handler, showChooseTimeAction, backCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await backCb()(ctx);

      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, false);
    });
  });

  describe('BOOKING_CHOOSE_DURATION_<minutes>', () => {
    it('replies with error and redirects to court selection when courtId is missing', async () => {
      const { handler, showChooseCourtAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        user: fakeUser,
        match: ['', `${SELECTED_DURATION}`] as unknown as RegExpExecArray,
        session: { sessionStartsAt: new Date(), bookingData: { dateAndTime: FUTURE_DATE_AND_TIME } },
      });

      await selectCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('replies with error and redirects to court selection when dateAndTime is missing', async () => {
      const { handler, showChooseCourtAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        user: fakeUser,
        match: ['', `${SELECTED_DURATION}`] as unknown as RegExpExecArray,
        session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } },
      });

      await selectCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('replies with error when dateAndTime is in the past', async () => {
      const { handler, showChooseCourtAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithDuration(`${SELECTED_DURATION}`, { dateAndTime: PAST_DATE_AND_TIME });

      await selectCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('errors.cannot_create_booking_with_selected_parameters');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('replies with error when duration is not in available list', async () => {
      const { handler, bookingSlotService, showChooseCourtAction, selectCb } = makeHandler();
      await handler.register();
      bookingSlotService.generateAvailableDurations.mockReturnValue([30]); // only 30 available
      const ctx = ctxWithDuration(`${SELECTED_DURATION}`); // 60 not in list

      await selectCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('errors.cannot_create_booking_with_selected_parameters');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('does not create booking when parameters are invalid', async () => {
      const { handler, bookingService, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithDuration(`${SELECTED_DURATION}`, { dateAndTime: PAST_DATE_AND_TIME });

      await selectCb()(ctx);

      expect(bookingService.create).not.toHaveBeenCalled();
    });

    it('creates booking with correct data on success', async () => {
      const { handler, bookingService, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithDuration(`${SELECTED_DURATION}`);

      await selectCb()(ctx);

      expect(bookingService.create).toHaveBeenCalledWith({
        user: { connect: { id: fakeUser.id } },
        court: { connect: { id: 1 } },
        dateFrom: FUTURE_DATE_AND_TIME.toDate(),
        dateTill: FUTURE_DATE_AND_TIME.add(SELECTED_DURATION, 'minute').toDate(),
      });
    });

    it('clears session bookingData after creating booking', async () => {
      const { handler, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithDuration(`${SELECTED_DURATION}`);

      await selectCb()(ctx);

      expect(ctx.session.bookingData).toEqual({});
    });

    it('calls ctx.editMessageText with booking_created confirmation', async () => {
      const { handler, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithDuration(`${SELECTED_DURATION}`);

      await selectCb()(ctx);

      expect(ctx.editMessageText).toHaveBeenCalledOnce();
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('booking_created');
    });

    it('uses NaN duration when match[1] is undefined, causing error redirect', async () => {
      const { handler, bookingSlotService, showChooseCourtAction, selectCb } = makeHandler();
      await handler.register();
      bookingSlotService.generateAvailableDurations.mockReturnValue([30, 60]);
      const ctx = createMockContext({
        user: fakeUser,
        match: [''] as unknown as RegExpExecArray,
        session: {
          sessionStartsAt: new Date(),
          bookingData: { courtId: 1, dateAndTime: FUTURE_DATE_AND_TIME },
        },
      });

      await selectCb()(ctx);

      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });
  });
});
