import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/types';
import { arrayChunk } from '../../../../utils/array.utils';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { Context } from '../../context';

export class ChooseTimeReply {
  private static getMessageText(ctx: Context): string {
    const bookingSummary = ctx.session.bookingData ? BookingSummaryFormatter.format(ctx.session.bookingData) + '\n\n' : '';

    return bookingSummary + '*Choose time*';
  }

  private static getMenuButtons(availableTime: string[]): (InlineKeyboardButton & { hide?: boolean; })[] {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    availableTime.forEach((time) => {
      buttons.push(Markup.button.callback(time, `BOOKING_CHOOSE_TIME_${time}`));
    });

    return buttons;
  }

  static async editMessageText(ctx: Context, availableTime: string[]) {
    ctx.answerCbQuery();
    ctx.editMessageText(this.getMessageText(ctx), {
      ...Markup.inlineKeyboard(arrayChunk(this.getMenuButtons(availableTime), 4)),
      parse_mode: 'Markdown'
    });
  }

  static async reply(ctx: Context, availableTime: string[]) {
    ctx.answerCbQuery();
    ctx.reply(this.getMessageText(ctx), {
      ...Markup.inlineKeyboard(arrayChunk(this.getMenuButtons(availableTime), 4)),
      parse_mode: 'Markdown'
    });
  }
}