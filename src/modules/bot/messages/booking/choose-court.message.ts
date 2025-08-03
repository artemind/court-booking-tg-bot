import { Context, Markup } from 'telegraf';
import type { Court } from '../../../../generated/prisma';
import { InlineKeyboardButton } from 'telegraf/types';

export class ChooseCourtMessage {
  static async reply(ctx: Context, courts: Court[]) {
    let courtsString = '';
    const buttons: (InlineKeyboardButton & { hide?: boolean; })[] = [];
    courts.forEach((court, index) => {
      courtsString += (index + 1).toString() + '. ' + court.name + '\n';
      buttons.push(Markup.button.callback((index + 1).toString(), `BOOKING_CHOOSE_COURT_${court.id}`));
    });

    ctx.reply("*Choose court for booking*\n" + courtsString, {
      ...Markup.inlineKeyboard([buttons]),
      parse_mode: 'Markdown'
    });
  }
}