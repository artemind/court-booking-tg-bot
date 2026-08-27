import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { BookingFormatter } from '../../formatters/booking.formatter';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import { I18n } from '@edjopato/telegraf-i18n';
import type { NotifiableBooking, NotificationKind } from '../../services/booking.service';

const NOTIFICATION_PRESENTATION: Record<NotificationKind, { emoji: string, i18nKey: string }> = {
  start: { emoji: '⏳', i18nKey: 'notifications.before_booking_starts' },
  end: { emoji: '⌛️', i18nKey: 'notifications.before_booking_ends' },
};

@injectable()
@provide()
export class SendNotificationAction {
  constructor(
    @inject(I18n)
    private i18n: I18n,
    @inject('APP_LOCALE')
    private defaultLanguageCode: string,
  ) {
  }

  async run(bot: Telegraf<Context>, booking: NotifiableBooking, kind: NotificationKind): Promise<Message.TextMessage> {
    const languageCode = booking.user.languageCode || this.defaultLanguageCode;
    const now = dayjs.utc().startOf('minute');
    const eventDate = dayjs(kind === 'start' ? booking.dateFrom : booking.dateTill).utc();
    const minutes = Math.max(0, eventDate.diff(now, 'minute'));

    const { emoji, i18nKey } = NOTIFICATION_PRESENTATION[kind];
    const message = `${emoji} ${this.i18n.t(languageCode, i18nKey, { minutes })}`;
    const formattedBooking = BookingFormatter.format(this.i18n, booking, languageCode);

    return bot.telegram.sendMessage(booking.user.telegramId.toString(), `*${message}*\n\n${formattedBooking}`, {
      parse_mode: 'Markdown',
    });
  }
}
