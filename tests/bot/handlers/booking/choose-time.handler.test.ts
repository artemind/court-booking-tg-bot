import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChooseTimeHandler } from '../../../../src/bot/handlers/booking/choose-time.handler';
import { ContextManager } from '../../../../src/bot/context.manager';
import { createMockContext } from '../../../helpers/create-mock-context';

const SELECTED_TIME = '10:30';

function makeHandler() {
  const actions: Array<{ pattern: string | RegExp; cb: Function }> = [];
  const bot = { action: vi.fn((p, cb) => actions.push({ pattern: p, cb })) };

  const chooseTimeAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseDateAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ChooseTimeHandler(
    bot as any,
    chooseTimeAction as any,
    showChooseDateAction as any,
  );

  const backCb = () => actions[0]!.cb;
  const selectCb = () => actions[1]!.cb;

  return { handler, bot, chooseTimeAction, showChooseDateAction, backCb, selectCb };
}

describe('ChooseTimeHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers two action handlers on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.action).toHaveBeenCalledTimes(2);
  });

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
    it('delegates to chooseTimeAction with the parsed time', async () => {
      const { handler, chooseTimeAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        match: ['', SELECTED_TIME] as unknown as RegExpExecArray,
        session: { sessionStartsAt: new Date(), bookingData: {} },
      });

      await selectCb()(ctx);

      expect(chooseTimeAction.run).toHaveBeenCalledWith(ctx, SELECTED_TIME);
    });
  });
});
