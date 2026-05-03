import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { Booking, Court } from '../../../generated/prisma';
import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { BookingFormatter } from '../../formatters/booking.formatter';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import { I18n } from '@edjopato/telegraf-i18n';

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

  async run(bot: Telegraf<Context>, booking: Booking & { user: {telegramId: bigint, languageCode: string|null}, court: Court }): Promise<undefined | Message.TextMessage> {
    const languageCode = booking.user.languageCode || this.defaultLanguageCode;
    const now = dayjs.utc().startOf('minute');
    const startDate = dayjs(booking.dateFrom).utc();
    const endDate = dayjs(booking.dateTill).utc();

    let message: string;
    if (now.isBefore(startDate)) {
      const minutesToEventStart = startDate.diff(now, 'minute');
      message = `⏳ ${this.i18n.t(languageCode, 'notifications.before_booking_starts', {minutes: minutesToEventStart})}`;
    } else if (now.isBefore(endDate)) {
      const minutesToEventEnd = endDate.diff(now, 'minute');
      message = `⌛️ ${this.i18n.t(languageCode, 'notifications.before_booking_ends', {minutes: minutesToEventEnd})}`;
    } else {
      return;
    }
    const formattedBooking = BookingFormatter.format(this.i18n, booking, languageCode);

    return bot.telegram.sendMessage(booking.user.telegramId.toString(), `*${message}*\n\n${formattedBooking}`, {
      parse_mode: 'Markdown',
    });
  }
}