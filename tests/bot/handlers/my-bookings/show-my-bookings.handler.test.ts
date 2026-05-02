import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowMyBookingsHandler } from '../../../../src/bot/handlers/my-bookings/show-my-bookings.handler';
import { createMockContext } from '../../../helpers/create-mock-context';

function makeHandler() {
  let hearsCb: Function | undefined;
  const bot = { hears: vi.fn((_, cb) => { hearsCb = cb; }) };
  const showMyBookingsAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ShowMyBookingsHandler(bot as any, showMyBookingsAction as any);
  const getCb = () => hearsCb!;

  return { handler, bot, showMyBookingsAction, getCb };
}

describe('ShowMyBookingsHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers one hears handler on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.hears).toHaveBeenCalledOnce();
  });

  describe('hears callback', () => {
    it('calls showMyBookingsAction.run(ctx, true)', async () => {
      const { handler, showMyBookingsAction, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb()(ctx);

      expect(showMyBookingsAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('returns the result of showMyBookingsAction.run', async () => {
      const { handler, showMyBookingsAction, getCb } = makeHandler();
      await handler.register();
      showMyBookingsAction.run.mockResolvedValue(true);

      const result = await getCb()(createMockContext());

      expect(result).toBe(true);
    });
  });
});
