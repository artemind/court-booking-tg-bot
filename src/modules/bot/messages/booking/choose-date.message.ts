import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/types';
import { arrayChunk } from '../../../../utils/array.utils';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { Context } from '../../context';
import { formatDate } from '../../../../utils/date.utils';

export class ChooseDateMessage {
  private static getMessageText(ctx: Context): string {
    const bookingSummary = BookingSummaryFormatter.format(ctx.session.bookingData!) + '\n\n';

    return bookingSummary + '*Choose date*';
  }

  private static getKeyboard(availableDates: Date[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    availableDates.forEach((date) => {
      buttons.push(Markup.button.callback(formatDate(date), `BOOKING_CHOOSE_DATE_${date.getTime()}`));
    });

    return Markup.inlineKeyboard(arrayChunk(buttons, 2));
  }

  static async editMessageText(ctx: Context, availableDates: Date[]) {

    ctx.answerCbQuery();
    ctx.editMessageText(this.getMessageText(ctx), {
      ...this.getKeyboard(availableDates),
      parse_mode: 'Markdown'
    });
  }

  static async reply(ctx: Context, availableDates: Date[]) {
    ctx.answerCbQuery();
    ctx.reply(this.getMessageText(ctx), {
      ...this.getKeyboard(availableDates),
      parse_mode: 'Markdown'
    });
  }
}