import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateNotificationPreferencesAction } from '../../../../src/bot/actions/notification-preferences/update-notification-preferences.action';
import { NotificationPreferencesUpdatedMessage } from '../../../../src/bot/messages/notification-preferences/notification-preferences-updated.message';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { User } from '../../../../src/generated/prisma';

const fakeUser: User = {
  id: 5,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Test User',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeAction() {
  const userService = { update: vi.fn().mockResolvedValue(fakeUser) };
  const action = new UpdateNotificationPreferencesAction(userService as any);
  return { action, userService };
}

describe('UpdateNotificationPreferencesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(NotificationPreferencesUpdatedMessage, 'reply').mockResolvedValue({ message_id: 1 } as any);
  });

  const ctx = () => createMockContext({ user: fakeUser });

  describe('enableNotificationBeforeBookingStarts', () => {
    it('calls userService.update with notifyBeforeBookingStarts=true', async () => {
      const { action, userService } = makeAction();
      await action.enableNotificationBeforeBookingStarts(ctx());
      expect(userService.update).toHaveBeenCalledWith(fakeUser.id, { notifyBeforeBookingStarts: true });
    });

    it('calls NotificationPreferencesUpdatedMessage.reply with updated user', async () => {
      const { action } = makeAction();
      const c = ctx();
      await action.enableNotificationBeforeBookingStarts(c);
      expect(NotificationPreferencesUpdatedMessage.reply).toHaveBeenCalledWith(c, fakeUser);
    });
  });

  describe('disableNotificationBeforeBookingStarts', () => {
    it('calls userService.update with notifyBeforeBookingStarts=false', async () => {
      const { action, userService } = makeAction();
      await action.disableNotificationBeforeBookingStarts(ctx());
      expect(userService.update).toHaveBeenCalledWith(fakeUser.id, { notifyBeforeBookingStarts: false });
    });

    it('calls NotificationPreferencesUpdatedMessage.reply with updated user', async () => {
      const { action } = makeAction();
      const c = ctx();
      await action.disableNotificationBeforeBookingStarts(c);
      expect(NotificationPreferencesUpdatedMessage.reply).toHaveBeenCalledWith(c, fakeUser);
    });
  });

  describe('enableNotificationBeforeBookingEnds', () => {
    it('calls userService.update with notifyBeforeBookingEnds=true', async () => {
      const { action, userService } = makeAction();
      await action.enableNotificationBeforeBookingEnds(ctx());
      expect(userService.update).toHaveBeenCalledWith(fakeUser.id, { notifyBeforeBookingEnds: true });
    });

    it('calls NotificationPreferencesUpdatedMessage.reply with updated user', async () => {
      const { action } = makeAction();
      const c = ctx();
      await action.enableNotificationBeforeBookingEnds(c);
      expect(NotificationPreferencesUpdatedMessage.reply).toHaveBeenCalledWith(c, fakeUser);
    });
  });

  describe('disableNotificationBeforeBookingEnds', () => {
    it('calls userService.update with notifyBeforeBookingEnds=false', async () => {
      const { action, userService } = makeAction();
      await action.disableNotificationBeforeBookingEnds(ctx());
      expect(userService.update).toHaveBeenCalledWith(fakeUser.id, { notifyBeforeBookingEnds: false });
    });

    it('calls NotificationPreferencesUpdatedMessage.reply with updated user', async () => {
      const { action } = makeAction();
      const c = ctx();
      await action.disableNotificationBeforeBookingEnds(c);
      expect(NotificationPreferencesUpdatedMessage.reply).toHaveBeenCalledWith(c, fakeUser);
    });
  });
});
