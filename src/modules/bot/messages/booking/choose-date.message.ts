import { Markup } from 'telegraf';
import { InlineKeyboardButton, type Message } from 'telegraf/types';
import { arrayChunk } from '../../../../utils/array.utils';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { Context } from '../../context';
import { formatDate } from '../../../../utils/date.utils';
import { I18nContext } from '@edjopato/telegraf-i18n';

export class ChooseDateMessage {
  private static getMessageText(ctx: Context): string {
    const bookingSummary = BookingSummaryFormatter.format(ctx.i18n, ctx.session.bookingData!) + '\n\n';

    return bookingSummary + `*${ctx.i18n.t('choose_date')}*`;
  }

  private static getKeyboard(i18n: I18nContext, availableDates: Date[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    availableDates.forEach((date) => {
      buttons.push(Markup.button.callback(formatDate(date, i18n.locale()), `BOOKING_CHOOSE_DATE_${date.getTime()}`));
    });
    const menuButtons = arrayChunk(buttons, 2);
    menuButtons.push([Markup.button.callback(i18n.t('back'), `BOOKING_CHOOSE_DATE_BACK`)]);

    return Markup.inlineKeyboard(menuButtons);
  }

  static async editMessageText(ctx: Context, availableDates: Date[]): Promise<true | Message.TextMessage> {

    await ctx.answerCbQuery();

    return ctx.editMessageText(this.getMessageText(ctx), {
      ...this.getKeyboard(ctx.i18n, availableDates),
      parse_mode: 'Markdown'
    });
  }

  static async reply(ctx: Context, availableDates: Date[]): Promise<Message.TextMessage> {
    await ctx.answerCbQuery();

    return ctx.reply(this.getMessageText(ctx), {
      ...this.getKeyboard(ctx.i18n, availableDates),
      parse_mode: 'Markdown'
    });
  }
}