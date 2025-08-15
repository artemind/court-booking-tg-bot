import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { Booking, Court } from '../../../../generated/prisma';
import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { BookingFormatter } from '../../formatters/booking.formatter';

export class SendNotificationAction {
  async run(bot: Telegraf<Context>, booking: Booking & { user: {telegramId: bigint}, court: Court }): Promise<undefined | Message.TextMessage> {
    let message = '';
    const now = dayjs.utc().startOf('minute');
    if (now.add(30, 'minutes').isSame(booking.dateFrom)) {
      message = '⏳ Your booking starts in 30 minutes';
    } else if (now.add(15, 'minutes').isSame(booking.dateTill)) {
      message = '⌛️ Your booking ends in 15 minutes';
    } else {
      return;
    }
    const formattedBooking = BookingFormatter.format(booking);

    return bot.telegram.sendMessage(Number(booking.user.telegramId), `*${message}*\n\n${formattedBooking}`, {
      parse_mode: 'Markdown',
    });
  }
}