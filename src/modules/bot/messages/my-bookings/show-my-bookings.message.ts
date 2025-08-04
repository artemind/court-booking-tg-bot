import { type Message } from 'telegraf/types';
import { Context } from '../../context';
import { Booking, Court } from '../../../../generated/prisma';
import { BookingFormatter } from '../../formatters/booking.formatter';

export class ShowMyBookingsMessage {
  private static getMessageText(bookings: (Booking & {court: Court})[]): string {
    if (bookings.length === 0) {
      return 'You don\'t have any bookings yet.';
    }
    let result = '';
    bookings.forEach((booking, index) => {
      result += `*------------- ${index + 1} -------------*\n` + BookingFormatter.format(booking) + '\n\n';
    });

    return result;
  }

  static async reply(ctx: Context, bookings: (Booking & {court: Court})[]): Promise<Message.TextMessage> {
    return ctx.reply(this.getMessageText(bookings), {
      parse_mode: 'Markdown'
    });
  }
}