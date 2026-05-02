import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowNotificationPreferencesHandler } from '../../../../src/bot/handlers/notification-preferences/show-notification-preferences.handler';
import { createMockContext } from '../../../helpers/create-mock-context';

function makeHandler() {
  let hearsCb: Function | undefined;
  const bot = { hears: vi.fn((_, cb) => { hearsCb = cb; }) };
  const showNotificationPreferencesAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ShowNotificationPreferencesHandler(bot as any, showNotificationPreferencesAction as any);
  const getCb = () => hearsCb!;

  return { handler, bot, showNotificationPreferencesAction, getCb };
}

describe('ShowNotificationPreferencesHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers one hears handler on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.hears).toHaveBeenCalledOnce();
  });

  describe('hears callback', () => {
    it('calls showNotificationPreferencesAction.run(ctx)', async () => {
      const { handler, showNotificationPreferencesAction, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb()(ctx);

      expect(showNotificationPreferencesAction.run).toHaveBeenCalledWith(ctx);
    });

    it('returns the result of showNotificationPreferencesAction.run', async () => {
      const { handler, showNotificationPreferencesAction, getCb } = makeHandler();
      await handler.register();
      showNotificationPreferencesAction.run.mockResolvedValue(true);

      const result = await getCb()(createMockContext());

      expect(result).toBe(true);
    });
  });
});
