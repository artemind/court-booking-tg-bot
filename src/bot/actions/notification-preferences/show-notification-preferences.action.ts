import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { NotificationPreferencesKeyboard } from '../../keyboards/notification-preferences.keyboard';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import type { IBookingConfig } from '../../../config/booking.config';
import { TOKENS } from '../../../config/tokens';

@injectable()
@provide()
export class ShowNotificationPreferencesAction {
  constructor(
    @inject(TOKENS.BookingConfig)
    private bookingConfig: IBookingConfig,
  ) {}

  async run(ctx: Context): Promise<Message.TextMessage> {
    const user = ctx.user!;

    return ctx.reply(ctx.i18n.t('notification_preferences'), NotificationPreferencesKeyboard.build(
      ctx.i18n,
      user.notifyBeforeBookingStarts,
      user.notifyBeforeBookingEnds,
      this.bookingConfig.minutesBeforeStartNotification,
      this.bookingConfig.minutesBeforeEndNotification,
    ));
  }
}