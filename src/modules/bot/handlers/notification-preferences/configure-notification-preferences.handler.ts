import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { UserService } from '../../services/user.service';
import {
  UpdateNotificationPreferencesAction
} from '../../actions/notification-preferences/update-notification-preferences.action';
import { match } from '@edjopato/telegraf-i18n';

export class ConfigureNotificationPreferencesHandler {
  constructor(
    private bot: Telegraf<Context>,
    private userService: UserService,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_starts_enabled'), async (ctx: Context): Promise<Message.TextMessage> => {
      return new UpdateNotificationPreferencesAction(this.userService).disableNotificationBeforeBookingStarts(ctx);
    });

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_starts_disabled'), async (ctx: Context): Promise<Message.TextMessage> => {
      return new UpdateNotificationPreferencesAction(this.userService).enableNotificationBeforeBookingStarts(ctx);
    });

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_ends_enabled'), async (ctx: Context): Promise<Message.TextMessage> => {
      return new UpdateNotificationPreferencesAction(this.userService).disableNotificationBeforeBookingEnds(ctx);
    });

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_ends_disabled'), async (ctx: Context): Promise<Message.TextMessage> => {
      return new UpdateNotificationPreferencesAction(this.userService).enableNotificationBeforeBookingEnds(ctx);
    });
  }
}