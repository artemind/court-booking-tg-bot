import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import {
  UpdateNotificationPreferencesAction
} from '../../actions/notification-preferences/update-notification-preferences.action';
import { match } from '@edjopato/telegraf-i18n';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ConfigureNotificationPreferencesHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(UpdateNotificationPreferencesAction)
    private updateNotificationPreferencesAction: UpdateNotificationPreferencesAction,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_starts_enabled'), async (ctx: Context): Promise<Message.TextMessage> => {
      return this.updateNotificationPreferencesAction.disableNotificationBeforeBookingStarts(ctx);
    });

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_starts_disabled'), async (ctx: Context): Promise<Message.TextMessage> => {
      return this.updateNotificationPreferencesAction.enableNotificationBeforeBookingStarts(ctx);
    });

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_ends_enabled'), async (ctx: Context): Promise<Message.TextMessage> => {
      return this.updateNotificationPreferencesAction.disableNotificationBeforeBookingEnds(ctx);
    });

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_ends_disabled'), async (ctx: Context): Promise<Message.TextMessage> => {
      return this.updateNotificationPreferencesAction.enableNotificationBeforeBookingEnds(ctx);
    });
  }
}