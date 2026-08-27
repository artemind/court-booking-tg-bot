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
import type { IBookingConfig } from '../../../config/booking.config';
import { TOKENS } from '../../../config/tokens';

@injectable()
@provide()
export class ConfigureNotificationPreferencesHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(UpdateNotificationPreferencesAction)
    private updateNotificationPreferencesAction: UpdateNotificationPreferencesAction,
    @inject(TOKENS.BookingConfig)
    private bookingConfig: IBookingConfig,
  ) {}

  async register(): Promise<void> {
    const action = this.updateNotificationPreferencesAction;
    const minutesBeforeStart = { minutes: this.bookingConfig.minutesBeforeStartNotification };
    const minutesBeforeEnd = { minutes: this.bookingConfig.minutesBeforeEndNotification };

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_starts_enabled', minutesBeforeStart), (ctx: Context): Promise<Message.TextMessage> =>
      action.run(ctx, 'notifyBeforeBookingStarts', false));

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_starts_disabled', minutesBeforeStart), (ctx: Context): Promise<Message.TextMessage> =>
      action.run(ctx, 'notifyBeforeBookingStarts', true));

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_ends_enabled', minutesBeforeEnd), (ctx: Context): Promise<Message.TextMessage> =>
      action.run(ctx, 'notifyBeforeBookingEnds', false));

    this.bot.hears(match('keyboards.notification_preferences.notify_before_booking_ends_disabled', minutesBeforeEnd), (ctx: Context): Promise<Message.TextMessage> =>
      action.run(ctx, 'notifyBeforeBookingEnds', true));
  }
}