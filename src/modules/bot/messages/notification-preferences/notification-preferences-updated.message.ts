import { type Message } from 'telegraf/types';
import { Context } from '../../context';
import { User } from '../../../../generated/prisma';
import { NotificationPreferencesKeyboard } from '../../keyboards/notification-preferences.keyboard';

export class NotificationPreferencesUpdatedMessage {
  static async reply(ctx: Context, user: User): Promise<Message.TextMessage> {
    return ctx.reply('Notification preferences updated successfully', NotificationPreferencesKeyboard.build(ctx.i18n, user.notifyBeforeBookingStarts, user.notifyBeforeBookingEnds));
  }
}