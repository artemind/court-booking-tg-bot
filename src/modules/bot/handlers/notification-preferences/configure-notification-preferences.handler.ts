import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { UserService } from '../../services/user.service';
import {
  NOTIFICATION_BEFORE_END_DISABLED,
  NOTIFICATION_BEFORE_END_ENABLED,
  NOTIFICATION_BEFORE_START_DISABLED,
  NOTIFICATION_BEFORE_START_ENABLED
} from '../../keyboards/notification-preferences.items';
import {
  UpdateNotificationPreferencesAction
} from '../../actions/notification-preferences/update-notification-preferences.action';

export class ConfigureNotificationPreferencesHandler {
  constructor(
    private bot: Telegraf<Context>,
    private userService: UserService,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(NOTIFICATION_BEFORE_START_ENABLED, async (ctx: Context): Promise<Message.TextMessage> => {
      return new UpdateNotificationPreferencesAction(this.userService).disableNotificationBeforeBookingStarts(ctx);
    });

    this.bot.hears(NOTIFICATION_BEFORE_START_DISABLED, async (ctx: Context): Promise<Message.TextMessage> => {
      return new UpdateNotificationPreferencesAction(this.userService).enableNotificationBeforeBookingStarts(ctx);
    });

    this.bot.hears(NOTIFICATION_BEFORE_END_ENABLED, async (ctx: Context): Promise<Message.TextMessage> => {
      return new UpdateNotificationPreferencesAction(this.userService).disableNotificationBeforeBookingEnds(ctx);
    });

    this.bot.hears(NOTIFICATION_BEFORE_END_DISABLED, async (ctx: Context): Promise<Message.TextMessage> => {
      return new UpdateNotificationPreferencesAction(this.userService).enableNotificationBeforeBookingEnds(ctx);
    });
  }
}