import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigureNotificationPreferencesHandler } from '../../../../src/bot/handlers/notification-preferences/configure-notification-preferences.handler';
import { createMockContext } from '../../../helpers/create-mock-context';

function makeHandler() {
  const hearsHandlers: Array<{ pattern: unknown; cb: Function }> = [];
  const bot = { hears: vi.fn((pattern, cb) => hearsHandlers.push({ pattern, cb })) };

  const updateNotificationPreferencesAction = {
    run: vi.fn().mockResolvedValue(true),
  };

  const handler = new ConfigureNotificationPreferencesHandler(bot as any, updateNotificationPreferencesAction as any);
  const getCb = (index: number) => hearsHandlers[index]!.cb;

  return { handler, bot, updateNotificationPreferencesAction, getCb };
}

describe('ConfigureNotificationPreferencesHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers four hears handlers on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.hears).toHaveBeenCalledTimes(4);
  });

  it.each([
    [0, 'notifyBeforeBookingStarts', false],
    [1, 'notifyBeforeBookingStarts', true],
    [2, 'notifyBeforeBookingEnds',   false],
    [3, 'notifyBeforeBookingEnds',   true],
  ] as const)('handler[%i] calls run with field=%s value=%s', async (index, field, value) => {
    const { handler, updateNotificationPreferencesAction, getCb } = makeHandler();
    await handler.register();
    const ctx = createMockContext();

    await getCb(index)(ctx);

    expect(updateNotificationPreferencesAction.run).toHaveBeenCalledWith(ctx, field, value);
  });
});
