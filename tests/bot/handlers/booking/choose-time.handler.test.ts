import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ChooseTimeHandler } from '../../../../src/bot/handlers/booking/choose-time.handler';
import { ContextManager } from '../../../../src/bot/context.manager';
import { createMockContext } from '../../../helpers/create-mock-context';

const SELECTED_TIME = '10:30';
const SESSION_DATE = dayjs.utc('2026-05-15').startOf('day');

function makeHandler() {
  const actions: Array<{ pattern: string | RegExp; cb: Function }> = [];
  const bot = { action: vi.fn((p, cb) => actions.push({ pattern: p, cb })) };

  const bookingService = { getByDate: vi.fn().mockResolvedValue([]) };
  const bookingSlotService = {
    generateAvailableTimeSlots: vi.fn().mockReturnValue([SELECTED_TIME, '11:00']),
  };
  const showChooseCourtAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseDateAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseTimeAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseDurationAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ChooseTimeHandler(
    bot as any,
    bookingService as any,
    bookingSlotService as any,
    showChooseCourtAction as any,
    showChooseDateAction as any,
    showChooseTimeAction as any,
    showChooseDurationAction as any,
  );

  const backCb = () => actions[0]!.cb;
  const selectCb = () => actions[1]!.cb;

  return { handler, bot, bookingService, bookingSlotService, showChooseCourtAction, showChooseDateAction, showChooseTimeAction, showChooseDurationAction, backCb, selectCb };
}

function ctxWithTime(time: string, bookingData?: object) {
  return createMockContext({
    match: ['', time] as unknown as RegExpExecArray,
    session: {
      sessionStartsAt: new Date(),
      bookingData: { courtId: 1, date: SESSION_DATE, ...bookingData },
    },
  });
}

describe('ChooseTimeHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('BOOKING_CHOOSE_TIME_BACK', () => {
    it('clears date selection via ContextManager', async () => {
      const { handler, backCb } = makeHandler();
      await handler.register();
      const spy = vi.spyOn(ContextManager, 'clearDateSelection');
      const ctx = createMockContext();

      await backCb()(ctx);

      expect(spy).toHaveBeenCalledWith(ctx);
    });

    it('navigates to date selection', async () => {
      const { handler, showChooseDateAction, backCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await backCb()(ctx);

      expect(showChooseDateAction.run).toHaveBeenCalledWith(ctx, false);
    });
  });

  describe('BOOKING_CHOOSE_TIME_<HH:MM>', () => {
    it('replies with error and redirects to court selection when courtId is missing', async () => {
      const { handler, showChooseCourtAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        match: ['', SELECTED_TIME] as unknown as RegExpExecArray,
        session: { sessionStartsAt: new Date(), bookingData: { date: SESSION_DATE } },
      });

      await selectCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('replies with error and redirects to court selection when date is missing', async () => {
      const { handler, showChooseCourtAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        match: ['', SELECTED_TIME] as unknown as RegExpExecArray,
        session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } },
      });

      await selectCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('queries existing bookings for the selected court and date', async () => {
      const { handler, bookingService, selectCb } = makeHandler();
      await handler.register();

      await selectCb()(ctxWithTime(SELECTED_TIME));

      expect(bookingService.getByDate).toHaveBeenCalledWith(1, SESSION_DATE);
    });

    it('replies with error and shows time selection again when time is already booked', async () => {
      const { handler, bookingSlotService, showChooseTimeAction, selectCb } = makeHandler();
      await handler.register();
      bookingSlotService.generateAvailableTimeSlots.mockReturnValue(['11:00']); // '10:30' not available
      const ctx = ctxWithTime(SELECTED_TIME);

      await selectCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('errors.selected_time_already_booked');
      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('sets bookingData.time to the selected time', async () => {
      const { handler, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithTime(SELECTED_TIME);

      await selectCb()(ctx);

      expect(ctx.session.bookingData!.time).toBe(SELECTED_TIME);
    });

    it('sets bookingData.dateAndTime to a UTC dayjs combining date and time', async () => {
      const { handler, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithTime(SELECTED_TIME);

      await selectCb()(ctx);

      const dt = ctx.session.bookingData!.dateAndTime!;
      expect(dt.format('YYYY-MM-DD HH:mm')).toBe('2026-05-15 10:30');
    });

    it('calls showChooseDurationAction.run(ctx, false) after valid time', async () => {
      const { handler, showChooseDurationAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithTime(SELECTED_TIME);

      await selectCb()(ctx);

      expect(showChooseDurationAction.run).toHaveBeenCalledWith(ctx, false);
    });
  });
});
