import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/types';
import { arrayChunk } from '../../../../utils/array.utils';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { Context } from '../../context';

export class ChooseTimeReply {
  private static getMessageText(ctx: Context): string {
    const bookingSummary = BookingSummaryFormatter.format(ctx.session.bookingData!) + '\n\n';

    return bookingSummary + '*Choose time*';
  }

  private static getKeyboard(availableTime: string[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    availableTime.forEach((time) => {
      buttons.push(Markup.button.callback(time, `BOOKING_CHOOSE_TIME_${time}`));
    });

    return Markup.inlineKeyboard(arrayChunk(buttons, 4));
  }

  static async editMessageText(ctx: Context, availableTime: string[]) {
    ctx.answerCbQuery();
    ctx.editMessageText(this.getMessageText(ctx), {
      ...this.getKeyboard(availableTime),
      parse_mode: 'Markdown'
    });
  }

  static async reply(ctx: Context, availableTime: string[]) {
    ctx.answerCbQuery();
    ctx.reply(this.getMessageText(ctx), {
      ...this.getKeyboard(availableTime),
      parse_mode: 'Markdown'
    });
  }
}