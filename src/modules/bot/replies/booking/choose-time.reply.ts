import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/types';
import { arrayChunk } from '../../../../utils/array.utils';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { Context } from '../../context';

export class ChooseTimeReply {
  static async editMessageText(ctx: Context, availableTime: string[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    availableTime.forEach((time) => {
      buttons.push(Markup.button.callback(time, `BOOKING_CHOOSE_TIME_${time}`));
    });
    ctx.answerCbQuery();
    const bookingSummary = ctx.session.bookingData ? BookingSummaryFormatter.format(ctx.session.bookingData) + '\n\n' : '';
    ctx.editMessageText(bookingSummary + '*Choose time*', {
      ...Markup.inlineKeyboard(arrayChunk(buttons, 4)),
      parse_mode: 'Markdown'
    });
  }
}