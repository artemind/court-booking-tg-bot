import { describe, it, expect, vi } from 'vitest';
import { NotificationPreferencesUpdatedMessage } from '../../../../src/bot/messages/notification-preferences/notification-preferences-updated.message';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { User } from '../../../../src/generated/prisma';

const fakeUser: User = {
  id: 7,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Test',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('NotificationPreferencesUpdatedMessage', () => {
  describe('reply', () => {
    it('calls ctx.reply with the success message text', async () => {
      const ctx = createMockContext();
      await NotificationPreferencesUpdatedMessage.reply(ctx, fakeUser);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toBe('Notification preferences updated successfully');
    });

    it('calls ctx.reply with a keyboard as second argument', async () => {
      const ctx = createMockContext();
      await NotificationPreferencesUpdatedMessage.reply(ctx, fakeUser);
      const [, keyboard] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(keyboard).toBeDefined();
      expect(keyboard.reply_markup).toBeDefined();
    });

    it('calls ctx.reply once', async () => {
      const ctx = createMockContext();
      await NotificationPreferencesUpdatedMessage.reply(ctx, fakeUser);
      expect(ctx.reply).toHaveBeenCalledOnce();
    });
  });
});
