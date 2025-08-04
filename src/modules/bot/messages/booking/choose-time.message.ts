import { Markup } from 'telegraf';
import { InlineKeyboardButton, type Message } from 'telegraf/types';
import { arrayChunk } from '../../../../utils/array.utils';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { Context } from '../../context';

export class ChooseTimeMessage {
  private static getMessageText(ctx: Context, availableTime: string[]): string {
    const bookingSummary = BookingSummaryFormatter.format(ctx.session.bookingData!) + '\n\n';

    return bookingSummary + (availableTime.length > 0 ? '*Choose time*' : '*There are not available times for this date.*');
  }

  private static getKeyboard(availableTime: string[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    availableTime.forEach((time) => {
      buttons.push(Markup.button.callback(time, `BOOKING_CHOOSE_TIME_${time}`));
    });
    const menuButtons = arrayChunk(buttons, 4);
    menuButtons.push([Markup.button.callback('<< Back', `BOOKING_CHOOSE_TIME_BACK`)]);

    return Markup.inlineKeyboard(menuButtons);
  }

  static async editMessageText(ctx: Context, availableTime: string[]): Promise<true | Message.TextMessage> {
    await ctx.answerCbQuery();

    return ctx.editMessageText(this.getMessageText(ctx, availableTime), {
      ...this.getKeyboard(availableTime),
      parse_mode: 'Markdown'
    });
  }

  static async reply(ctx: Context, availableTime: string[]): Promise<Message.TextMessage> {
    await ctx.answerCbQuery();
    return ctx.reply(this.getMessageText(ctx, availableTime), {
      ...this.getKeyboard(availableTime),
      parse_mode: 'Markdown'
    });
  }
}