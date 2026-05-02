import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowNotificationPreferencesAction } from '../../../../src/bot/actions/notification-preferences/show-notification-preferences.action';
import { NotificationPreferencesKeyboard } from '../../../../src/bot/keyboards/notification-preferences.keyboard';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { User } from '../../../../src/generated/prisma';

const fakeUser: User = {
  id: 1,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Test User',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeKeyboard = { reply_markup: { keyboard: [] } } as any;

describe('ShowNotificationPreferencesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(NotificationPreferencesKeyboard, 'build').mockReturnValue(fakeKeyboard);
  });

  it("calls ctx.reply with the 'notification_preferences' i18n key", async () => {
    const action = new ShowNotificationPreferencesAction();
    const ctx = createMockContext({ user: fakeUser });

    await action.run(ctx);

    expect(ctx.reply).toHaveBeenCalledOnce();
    const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(text).toBe('notification_preferences');
  });

  it('builds keyboard with user notification preferences', async () => {
    const action = new ShowNotificationPreferencesAction();
    const ctx = createMockContext({ user: fakeUser });

    await action.run(ctx);

    expect(NotificationPreferencesKeyboard.build).toHaveBeenCalledWith(
      ctx.i18n,
      fakeUser.notifyBeforeBookingStarts,
      fakeUser.notifyBeforeBookingEnds,
    );
  });

  it('passes the keyboard to ctx.reply', async () => {
    const action = new ShowNotificationPreferencesAction();
    const ctx = createMockContext({ user: fakeUser });

    await action.run(ctx);

    const [, keyboard] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(keyboard).toBe(fakeKeyboard);
  });
});
