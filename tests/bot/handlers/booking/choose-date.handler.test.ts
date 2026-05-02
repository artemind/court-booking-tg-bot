import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ChooseDateHandler } from '../../../../src/bot/handlers/booking/choose-date.handler';
import { InvalidDateSelectedException } from '../../../../src/bot/exceptions/invalid-date-selected.exception';
import { ContextManager } from '../../../../src/bot/context.manager';
import { createMockContext } from '../../../helpers/create-mock-context';

// A date that will be included in the "available" list
const AVAILABLE_DATE = dayjs.utc('2026-05-15').startOf('day');
const AVAILABLE_TIMESTAMP = AVAILABLE_DATE.valueOf().toString();

function makeHandler() {
  const actions: Array<{ pattern: string | RegExp; cb: Function }> = [];
  const bot = { action: vi.fn((p, cb) => actions.push({ pattern: p, cb })) };

  const bookingSlotService = {
    generateDateSlots: vi.fn().mockReturnValue([AVAILABLE_DATE]),
  };
  const showChooseCourtAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseTimeAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ChooseDateHandler(
    bot as any,
    bookingSlotService as any,
    showChooseCourtAction as any,
    showChooseTimeAction as any,
  );

  const backCb = () => actions[0]!.cb;
  const selectCb = () => actions[1]!.cb;

  return { handler, bot, bookingSlotService, showChooseCourtAction, showChooseTimeAction, backCb, selectCb };
}

describe('ChooseDateHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers two actions on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.action).toHaveBeenCalledTimes(2);
  });

  describe('BOOKING_CHOOSE_DATE_BACK', () => {
    it('resets booking data via ContextManager', async () => {
      const { handler, backCb } = makeHandler();
      await handler.register();
      const spy = vi.spyOn(ContextManager, 'resetBookingData');
      const ctx = createMockContext({ session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } } });

      await backCb()(ctx);

      expect(spy).toHaveBeenCalledWith(ctx);
    });

    it('navigates to court selection', async () => {
      const { handler, showChooseCourtAction, backCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await backCb()(ctx);

      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, false);
    });
  });

  describe('BOOKING_CHOOSE_DATE_<timestamp>', () => {
    function ctxWithDate(timestamp: string, courtId?: number) {
      return createMockContext({
        match: ['', timestamp] as unknown as RegExpExecArray,
        session: {
          sessionStartsAt: new Date(),
          bookingData: courtId !== undefined ? { courtId } : {},
        },
      });
    }

    it('replies with error and redirects to court selection when courtId is missing', async () => {
      const { handler, showChooseCourtAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithDate(AVAILABLE_TIMESTAMP);

      await selectCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('throws InvalidDateSelectedException for date not in available list', async () => {
      const { handler, selectCb } = makeHandler();
      await handler.register();
      const pastTimestamp = dayjs.utc('2020-01-01').startOf('day').valueOf().toString();
      const ctx = ctxWithDate(pastTimestamp, 1);

      await expect(selectCb()(ctx)).rejects.toBeInstanceOf(InvalidDateSelectedException);
    });

    it('sets bookingData.date to the parsed UTC date', async () => {
      const { handler, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithDate(AVAILABLE_TIMESTAMP, 1);

      await selectCb()(ctx);

      expect(ctx.session.bookingData!.date!.format('DD-MM-YYYY')).toBe(AVAILABLE_DATE.format('DD-MM-YYYY'));
    });

    it('calls showChooseTimeAction.run(ctx, false) after valid date', async () => {
      const { handler, showChooseTimeAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = ctxWithDate(AVAILABLE_TIMESTAMP, 1);

      await selectCb()(ctx);

      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, false);
    });

    it('uses NaN timestamp when match[1] is undefined, causing InvalidDateSelectedException', async () => {
      const { handler, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        match: [''] as unknown as RegExpExecArray,
        session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } },
      });

      await expect(selectCb()(ctx)).rejects.toBeInstanceOf(InvalidDateSelectedException);
    });
  });
});
