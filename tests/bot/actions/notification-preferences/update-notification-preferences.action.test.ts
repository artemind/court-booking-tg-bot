import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateNotificationPreferencesAction } from '../../../../src/bot/actions/notification-preferences/update-notification-preferences.action';
import { NotificationPreferencesUpdatedMessage } from '../../../../src/bot/messages/notification-preferences/notification-preferences-updated.message';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { User } from '../../../../src/generated/prisma';
import type { IBookingConfig } from '../../../../src/config/booking.config';

const fakeBookingConfig: IBookingConfig = {
  availableFromTime: '07:00',
  availableToTime: '23:59',
  slotSizeMinutes: 30,
  minDurationMinutes: 30,
  maxDurationMinutes: 180,
  daysAhead: 7,
  minutesBeforeStartNotification: 30,
  minutesBeforeEndNotification: 15,
};

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
  const action = new UpdateNotificationPreferencesAction(userService as any, fakeBookingConfig);
  return { action, userService };
}

describe('UpdateNotificationPreferencesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(NotificationPreferencesUpdatedMessage, 'reply').mockResolvedValue({ message_id: 1 } as any);
  });

  const ctx = () => createMockContext({ user: fakeUser });

  it.each([
    ['notifyBeforeBookingStarts', true],
    ['notifyBeforeBookingStarts', false],
    ['notifyBeforeBookingEnds', true],
    ['notifyBeforeBookingEnds', false],
  ] as const)('calls userService.update with %s=%s', async (field, value) => {
    const { action, userService } = makeAction();
    await action.run(ctx(), field, value);
    expect(userService.update).toHaveBeenCalledWith(fakeUser.id, { [field]: value });
  });

  it('calls NotificationPreferencesUpdatedMessage.reply with updated user', async () => {
    const { action } = makeAction();
    const c = ctx();
    await action.run(c, 'notifyBeforeBookingStarts', true);
    expect(NotificationPreferencesUpdatedMessage.reply).toHaveBeenCalledWith(c, fakeUser, fakeBookingConfig);
  });
});
