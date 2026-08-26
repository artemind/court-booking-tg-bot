import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ChooseTimeAction } from '../../../../src/bot/actions/booking/choose-time.action';
import { createMockContext } from '../../../helpers/create-mock-context';

const SELECTED_TIME = '10:30';
const SESSION_DATE = dayjs.utc('2026-05-15').startOf('day');

function makeAction() {
  const bookingService = { getByDate: vi.fn().mockResolvedValue([]) };
  const bookingSlotService = {
    generateAvailableTimeSlots: vi.fn().mockReturnValue([SELECTED_TIME, '11:00']),
  };
  const showChooseCourtAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseTimeAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseDurationAction = { run: vi.fn().mockResolvedValue(true) };

  const action = new ChooseTimeAction(
    bookingService as any,
    bookingSlotService as any,
    showChooseCourtAction as any,
    showChooseTimeAction as any,
    showChooseDurationAction as any,
  );

  return { action, bookingService, bookingSlotService, showChooseCourtAction, showChooseTimeAction, showChooseDurationAction };
}

function ctxWithData(bookingData?: object) {
  return createMockContext({
    session: {
      sessionStartsAt: new Date(),
      bookingData: { courtId: 1, date: SESSION_DATE, ...bookingData },
    },
  });
}

describe('ChooseTimeAction', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('session guard', () => {
    it('replies with error and redirects when courtId is missing', async () => {
      const { action, showChooseCourtAction } = makeAction();
      const ctx = createMockContext({
        session: { sessionStartsAt: new Date(), bookingData: { date: SESSION_DATE } },
      });

      await action.run(ctx, SELECTED_TIME);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('replies with error and redirects when date is missing', async () => {
      const { action, showChooseCourtAction } = makeAction();
      const ctx = createMockContext({
        session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } },
      });

      await action.run(ctx, SELECTED_TIME);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('does not query bookings when session guard fails', async () => {
      const { action, bookingService } = makeAction();
      const ctx = createMockContext({ session: { sessionStartsAt: new Date(), bookingData: {} } });

      await action.run(ctx, SELECTED_TIME);

      expect(bookingService.getByDate).not.toHaveBeenCalled();
    });
  });

  describe('time validation', () => {
    it('queries bookings for the selected court and date', async () => {
      const { action, bookingService } = makeAction();
      await action.run(ctxWithData(), SELECTED_TIME);
      expect(bookingService.getByDate).toHaveBeenCalledWith(1, SESSION_DATE);
    });

    it('replies with error and shows time selection when time is already booked', async () => {
      const { action, bookingSlotService, showChooseTimeAction } = makeAction();
      bookingSlotService.generateAvailableTimeSlots.mockReturnValue(['11:00']);
      const ctx = ctxWithData();

      await action.run(ctx, SELECTED_TIME);

      expect(ctx.reply).toHaveBeenCalledWith('errors.selected_time_already_booked');
      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, true);
    });
  });

  describe('on valid time', () => {
    it('sets bookingData.time to the selected time', async () => {
      const { action } = makeAction();
      const ctx = ctxWithData();

      await action.run(ctx, SELECTED_TIME);

      expect(ctx.session.bookingData!.time).toBe(SELECTED_TIME);
    });

    it('calls showChooseDurationAction.run(ctx, false)', async () => {
      const { action, showChooseDurationAction } = makeAction();
      const ctx = ctxWithData();

      await action.run(ctx, SELECTED_TIME);

      expect(showChooseDurationAction.run).toHaveBeenCalledWith(ctx, false);
    });
  });
});
