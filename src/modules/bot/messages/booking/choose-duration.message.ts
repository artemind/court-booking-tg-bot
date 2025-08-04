import { Markup } from 'telegraf';
import { InlineKeyboardButton, type Message } from 'telegraf/types';
import { arrayChunk } from '../../../../utils/array.utils';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { Context } from '../../context';
import { formatMinutes } from '../../../../utils/time.utils';

export class ChooseDurationMessage {
  private static getMessageText(ctx: Context): string {
    const bookingSummary = BookingSummaryFormatter.format(ctx.session.bookingData!) + '\n\n';

    return bookingSummary + '*Choose duration*';
  }

  private static getKeyboard(availableDurations: number[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    availableDurations.forEach((duration) => {
      buttons.push(Markup.button.callback(formatMinutes(duration), `BOOKING_CHOOSE_DURATION_${duration}`));
    });
    const menuButtons = arrayChunk(buttons, 3);
    menuButtons.push([Markup.button.callback('<< Back', `BOOKING_CHOOSE_DURATION_BACK`)]);

    return Markup.inlineKeyboard(menuButtons);
  }

  static async editMessageText(ctx: Context, availableDurations: number[]): Promise<true | Message.TextMessage> {
    await ctx.answerCbQuery();

    return ctx.editMessageText(this.getMessageText(ctx), {
      ...this.getKeyboard(availableDurations),
      parse_mode: 'Markdown'
    });
  }

  static async reply(ctx: Context, availableDurations: number[]): Promise<Message.TextMessage> {
    await ctx.answerCbQuery();

    return ctx.reply(this.getMessageText(ctx), {
      ...this.getKeyboard(availableDurations),
      parse_mode: 'Markdown'
    });
  }
}