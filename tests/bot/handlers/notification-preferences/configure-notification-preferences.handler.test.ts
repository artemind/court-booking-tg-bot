import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigureNotificationPreferencesHandler } from '../../../../src/bot/handlers/notification-preferences/configure-notification-preferences.handler';
import { createMockContext } from '../../../helpers/create-mock-context';

function makeHandler() {
  const hearsHandlers: Array<{ pattern: unknown; cb: Function }> = [];
  const bot = { hears: vi.fn((pattern, cb) => hearsHandlers.push({ pattern, cb })) };

  const updateNotificationPreferencesAction = {
    disableNotificationBeforeBookingStarts: vi.fn().mockResolvedValue(true),
    enableNotificationBeforeBookingStarts: vi.fn().mockResolvedValue(true),
    disableNotificationBeforeBookingEnds: vi.fn().mockResolvedValue(true),
    enableNotificationBeforeBookingEnds: vi.fn().mockResolvedValue(true),
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

  describe('notify_before_booking_starts_enabled handler', () => {
    it('calls disableNotificationBeforeBookingStarts', async () => {
      const { handler, updateNotificationPreferencesAction, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb(0)(ctx);

      expect(updateNotificationPreferencesAction.disableNotificationBeforeBookingStarts).toHaveBeenCalledWith(ctx);
    });
  });

  describe('notify_before_booking_starts_disabled handler', () => {
    it('calls enableNotificationBeforeBookingStarts', async () => {
      const { handler, updateNotificationPreferencesAction, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb(1)(ctx);

      expect(updateNotificationPreferencesAction.enableNotificationBeforeBookingStarts).toHaveBeenCalledWith(ctx);
    });
  });

  describe('notify_before_booking_ends_enabled handler', () => {
    it('calls disableNotificationBeforeBookingEnds', async () => {
      const { handler, updateNotificationPreferencesAction, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb(2)(ctx);

      expect(updateNotificationPreferencesAction.disableNotificationBeforeBookingEnds).toHaveBeenCalledWith(ctx);
    });
  });

  describe('notify_before_booking_ends_disabled handler', () => {
    it('calls enableNotificationBeforeBookingEnds', async () => {
      const { handler, updateNotificationPreferencesAction, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb(3)(ctx);

      expect(updateNotificationPreferencesAction.enableNotificationBeforeBookingEnds).toHaveBeenCalledWith(ctx);
    });
  });
});
