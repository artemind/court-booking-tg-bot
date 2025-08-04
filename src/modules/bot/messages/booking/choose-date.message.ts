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
    const menuButtons = arrayChunk(buttons, 2);
    menuButtons.push([Markup.button.callback('<< Back', `BOOKING_CHOOSE_DATE_BACK`)]);

    return Markup.inlineKeyboard(menuButtons);
  }

  static async editMessageText(ctx: Context, availableDates: Date[]): Promise<void> {

    await ctx.answerCbQuery();
    await ctx.editMessageText(this.getMessageText(ctx), {
      ...this.getKeyboard(availableDates),
      parse_mode: 'Markdown'
    });
  }

  static async reply(ctx: Context, availableDates: Date[]): Promise<void> {
    await ctx.answerCbQuery();
    await ctx.reply(this.getMessageText(ctx), {
      ...this.getKeyboard(availableDates),
      parse_mode: 'Markdown'
    });
  }
}