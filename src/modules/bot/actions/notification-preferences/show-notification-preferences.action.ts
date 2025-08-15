import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { NotificationPreferencesKeyboard } from '../../keyboards/notification-preferences.keyboard';

export class ShowNotificationPreferencesAction {
  async run(ctx: Context): Promise<Message.TextMessage> {
    const user = ctx.user!;

    return ctx.reply('Notification Preferences', NotificationPreferencesKeyboard.build(user.notifyBeforeBookingStarts, user.notifyBeforeBookingEnds));
  }
}