import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { NOTIFICATION_PREFERENCES } from '../../keyboards/main-menu.items';
import type { Message } from 'telegraf/types';
import { ShowNotificationPreferencesAction } from '../../actions/notification-preferences/show-notification-preferences.action';

export class ShowNotificationPreferencesHandler {
  constructor(
    private bot: Telegraf<Context>,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(NOTIFICATION_PREFERENCES, async (ctx: Context): Promise<true | Message.TextMessage> => {
      return new ShowNotificationPreferencesAction().run(ctx);
    });
  }
}