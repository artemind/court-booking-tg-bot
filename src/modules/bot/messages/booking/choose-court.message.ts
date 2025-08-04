import { Context, Markup } from 'telegraf';
import type { Court } from '../../../../generated/prisma';
import { InlineKeyboardButton } from 'telegraf/types';

export class ChooseCourtMessage {
  private static getMessageText(courts: Court[]): string {
    let courtsString = '';
    courts.forEach((court, index) => {
      courtsString += (index + 1).toString() + '. ' + court.name + '\n';
    });

    return "*Choose court for booking*\n" + courtsString;
  }

  private static getKeyboard(courts: Court[]) {
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    courts.forEach((court, index) => {
      buttons.push(Markup.button.callback((index + 1).toString(), `BOOKING_CHOOSE_COURT_${court.id}`));
    });

    return Markup.inlineKeyboard([buttons]);
  }

  static async reply(ctx: Context, courts: Court[]): Promise<void> {
    await ctx.reply(this.getMessageText(courts), {
      ...this.getKeyboard(courts),
      parse_mode: 'Markdown'
    });
  }

  static async editMessageText(ctx: Context, courts: Court[]): Promise<void> {
    await ctx.editMessageText(this.getMessageText(courts), {
      ...this.getKeyboard(courts),
      parse_mode: 'Markdown'
    });
  }
}