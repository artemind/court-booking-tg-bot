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
    let message = '';
    const languageCode = booking.user.languageCode || this.defaultLanguageCode;
    const now = dayjs.utc().startOf('minute');
    if (now.add(30, 'minutes').isSame(booking.dateFrom)) {
      message = `⏳ ${this.i18n.t(languageCode, 'notifications.before_booking_starts', {minutes: 30})}`;
    } else if (now.add(15, 'minutes').isSame(booking.dateTill)) {
      message = `⌛️ ${this.i18n.t(languageCode, 'notifications.before_booking_ends', {minutes: 15})}`;
    } else {
      return;
    }
    const formattedBooking = BookingFormatter.format(this.i18n, booking, languageCode);

    return bot.telegram.sendMessage(Number(booking.user.telegramId), `*${message}*\n\n${formattedBooking}`, {
      parse_mode: 'Markdown',
    });
  }
}