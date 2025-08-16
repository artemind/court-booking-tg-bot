import { InlineKeyboardButton, type Message } from 'telegraf/types';
import { Context } from '../../context';
import { Booking, Court } from '../../../../generated/prisma';
import { BookingFormatter } from '../../formatters/booking.formatter';
import { Markup } from 'telegraf';
import { arrayChunk } from '../../../../utils/array.utils';
import { I18nContext } from '@edjopato/telegraf-i18n';

export class ShowMyBookingsMessage {
  private static getMessageText(i18n: I18nContext, bookings: (Booking & {court: Court})[]): string {
    if (bookings.length === 0) {
      return i18n.t('booking_list_is_empty');
    }
    let result = `📌 ${i18n.t('my_bookings')}\n`;
    bookings.forEach((booking, index) => {
      result += `*------------- ${index + 1} -------------*\n` + BookingFormatter.format(i18n, booking) + '\n\n';
    });

    return result;
  }

  private static getKeyboard(i18n: I18nContext, bookings: Booking[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    bookings.forEach((booking, index) => {
      buttons.push(Markup.button.callback(`❌ ${i18n.t('cancel_booking')} ${index + 1}`, `CANCEL_MY_BOOKING_${booking.id}`));
    });

    return Markup.inlineKeyboard(arrayChunk(buttons, 2));
  }

  static async reply(ctx: Context, bookings: (Booking & {court: Court})[]): Promise<Message.TextMessage> {
    return ctx.reply(this.getMessageText(ctx.i18n, bookings), {
      ...this.getKeyboard(ctx.i18n, bookings),
      parse_mode: 'Markdown'
    });
  }

  static async editMessageText(ctx: Context, bookings: (Booking & {court: Court})[]): Promise<true | Message.TextMessage> {
    return ctx.editMessageText(this.getMessageText(ctx.i18n, bookings), {
      ...this.getKeyboard(ctx.i18n, bookings),
      parse_mode: 'Markdown'
    });
  }
}