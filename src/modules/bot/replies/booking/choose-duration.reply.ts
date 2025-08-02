import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/types';
import { arrayChunk } from '../../../../utils/array.utils';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { Context } from '../../context';
import { formatMinutes } from '../../../../utils/time.utils';

export class ChooseDurationReply {
  private static getMessageText(ctx: Context): string {
    const bookingSummary = ctx.session.bookingData ? BookingSummaryFormatter.format(ctx.session.bookingData) + '\n\n' : '';

    return bookingSummary + '*Choose duration*';
  }

  private static getKeyboard(availableDurations: number[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    availableDurations.forEach((duration) => {
      buttons.push(Markup.button.callback(formatMinutes(duration), `BOOKING_CHOOSE_duration_${duration}`));
    });

    return Markup.inlineKeyboard(arrayChunk(buttons, 3));
  }

  static async editMessageText(ctx: Context, availableDurations: number[]) {
    ctx.answerCbQuery();
    ctx.editMessageText(this.getMessageText(ctx), {
      ...this.getKeyboard(availableDurations),
      parse_mode: 'Markdown'
    });
  }

  static async reply(ctx: Context, availableDurations: number[]) {
    ctx.answerCbQuery();
    ctx.reply(this.getMessageText(ctx), {
      ...this.getKeyboard(availableDurations),
      parse_mode: 'Markdown'
    });
  }
}