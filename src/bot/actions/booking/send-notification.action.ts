import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { Booking, Court } from '../../../generated/prisma';
import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { BookingFormatter } from '../../formatters/booking.formatter';
import { injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class SendNotificationAction {
  async run(bot: Telegraf<Context>, booking: Booking & { user: {telegramId: bigint}, court: Court }): Promise<undefined | Message.TextMessage> {
    let message = '';
    const now = dayjs.utc().startOf('minute');
    if (now.add(30, 'minutes').isSame(booking.dateFrom)) {
      message = `⏳ ${bot.context.i18n!.t('notifications.before_booking_starts', {minutes: 30})}`;
    } else if (now.add(15, 'minutes').isSame(booking.dateTill)) {
      message = `⌛️ ${bot.context.i18n!.t('notifications.before_booking_ends', {minutes: 15})}`;
    } else {
      return;
    }
    const formattedBooking = BookingFormatter.format(bot.context.i18n!, booking);

    return bot.telegram.sendMessage(Number(booking.user.telegramId), `*${message}*\n\n${formattedBooking}`, {
      parse_mode: 'Markdown',
    });
  }
}