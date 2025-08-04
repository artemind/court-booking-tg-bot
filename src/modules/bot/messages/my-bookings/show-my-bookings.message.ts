import { InlineKeyboardButton, type Message } from 'telegraf/types';
import { Context } from '../../context';
import { Booking, Court } from '../../../../generated/prisma';
import { BookingFormatter } from '../../formatters/booking.formatter';
import { Markup } from 'telegraf';
import { arrayChunk } from '../../../../utils/array.utils';

export class ShowMyBookingsMessage {
  private static getMessageText(bookings: (Booking & {court: Court})[]): string {
    if (bookings.length === 0) {
      return 'You don\'t have any bookings yet.';
    }
    let result = '📌 My Bookings\n';
    bookings.forEach((booking, index) => {
      result += `*------------- ${index + 1} -------------*\n` + BookingFormatter.format(booking) + '\n\n';
    });

    return result;
  }

  private static getKeyboard(bookings: Booking[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    bookings.forEach((booking, index) => {
      buttons.push(Markup.button.callback(`❌ Cancel Booking ${index + 1}`, `CANCEL_MY_BOOKING_${booking.id}`));
    });

    return Markup.inlineKeyboard(arrayChunk(buttons, 2));
  }

  static async reply(ctx: Context, bookings: (Booking & {court: Court})[]): Promise<Message.TextMessage> {
    return ctx.reply(this.getMessageText(bookings), {
      ...this.getKeyboard(bookings),
      parse_mode: 'Markdown'
    });
  }
}