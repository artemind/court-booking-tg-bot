import { type Message } from 'telegraf/types';
import { Context } from '../../context';
import { User } from '../../../generated/prisma';
import { NotificationPreferencesKeyboard } from '../../keyboards/notification-preferences.keyboard';
import { IBookingConfig } from '../../../config/booking.config';

export class NotificationPreferencesUpdatedMessage {
  static async reply(ctx: Context, user: User, bookingConfig: IBookingConfig): Promise<Message.TextMessage> {
    return ctx.reply(ctx.i18n.t('notification_preferences_updated'), NotificationPreferencesKeyboard.build(
      ctx.i18n,
      user.notifyBeforeBookingStarts,
      user.notifyBeforeBookingEnds,
      bookingConfig.minutesBeforeStartNotification,
      bookingConfig.minutesBeforeEndNotification,
    ));
  }
}