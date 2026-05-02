import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StartBookingHandler } from '../../../../src/bot/handlers/booking/start-booking.handler';
import { createMockContext } from '../../../helpers/create-mock-context';

function makeHandler() {
  let hearsCb: Function | undefined;
  const bot = { hears: vi.fn((_, cb) => { hearsCb = cb; }) };
  const showChooseCourtAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new StartBookingHandler(bot as any, showChooseCourtAction as any);
  const getCb = () => hearsCb!;

  return { handler, bot, showChooseCourtAction, getCb };
}

describe('StartBookingHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers one hears handler on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.hears).toHaveBeenCalledOnce();
  });

  describe('hears callback', () => {
    it('calls showChooseCourtAction.run(ctx, true)', async () => {
      const { handler, showChooseCourtAction, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb()(ctx);

      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('returns the result of showChooseCourtAction.run', async () => {
      const { handler, showChooseCourtAction, getCb } = makeHandler();
      await handler.register();
      showChooseCourtAction.run.mockResolvedValue(true);

      const result = await getCb()(createMockContext());

      expect(result).toBe(true);
    });
  });
});
