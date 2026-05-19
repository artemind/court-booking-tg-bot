import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ChooseDateHandler } from '../../../../src/bot/handlers/booking/choose-date.handler';
import { ContextManager } from '../../../../src/bot/context.manager';
import { createMockContext } from '../../../helpers/create-mock-context';

const AVAILABLE_DATE = dayjs.utc('2026-05-15').startOf('day');
const AVAILABLE_TIMESTAMP = AVAILABLE_DATE.valueOf().toString();

function makeHandler() {
  const actions: Array<{ pattern: string | RegExp; cb: Function }> = [];
  const bot = { action: vi.fn((p, cb) => actions.push({ pattern: p, cb })) };

  const chooseDateAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseCourtAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ChooseDateHandler(
    bot as any,
    chooseDateAction as any,
    showChooseCourtAction as any,
  );

  const backCb = () => actions[0]!.cb;
  const selectCb = () => actions[1]!.cb;

  return { handler, bot, chooseDateAction, showChooseCourtAction, backCb, selectCb };
}

describe('ChooseDateHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers two action handlers on the bot', async () => {
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
    it('delegates to chooseDateAction with the timestamp string', async () => {
      const { handler, chooseDateAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        match: ['', AVAILABLE_TIMESTAMP] as unknown as RegExpExecArray,
        session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } },
      });

      await selectCb()(ctx);

      expect(chooseDateAction.run).toHaveBeenCalledWith(ctx, AVAILABLE_TIMESTAMP);
    });
  });
});
