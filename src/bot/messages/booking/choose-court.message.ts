import { Markup } from 'telegraf';
import type { Court } from '../../../generated/prisma';
import { InlineKeyboardButton, type Message } from 'telegraf/types';
import { I18nContext } from '@edjopato/telegraf-i18n';
import { Context } from '../../context';

export class ChooseCourtMessage {
  private static getMessageText(i18n: I18nContext, courts: Court[]): string {
    let courtsString = '';
    courts.forEach((court, index) => {
      courtsString += (index + 1).toString() + '. ' + court.name + '\n';
    });

    return `*${i18n.t('choose_court')}*\n${courtsString}`;
  }

  private static getKeyboard(courts: Court[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    courts.forEach((court, index) => {
      buttons.push(Markup.button.callback((index + 1).toString(), `BOOKING_CHOOSE_COURT_${court.id}`));
    });

    return Markup.inlineKeyboard([buttons]);
  }

  static async reply(ctx: Context, courts: Court[]): Promise<Message.TextMessage> {
    return ctx.reply(this.getMessageText(ctx.i18n, courts), {
      ...this.getKeyboard(courts),
      parse_mode: 'Markdown'
    });
  }

  static async editMessageText(ctx: Context, courts: Court[]): Promise<true | Message.TextMessage> {
    return ctx.editMessageText(this.getMessageText(ctx.i18n, courts), {
      ...this.getKeyboard(courts),
      parse_mode: 'Markdown'
    });
  }
}