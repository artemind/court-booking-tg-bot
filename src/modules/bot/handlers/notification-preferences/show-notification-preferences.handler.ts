import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { ShowNotificationPreferencesAction } from '../../actions/notification-preferences/show-notification-preferences.action';
import { match } from '@edjopato/telegraf-i18n';

export class ShowNotificationPreferencesHandler {
  constructor(
    private bot: Telegraf<Context>,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.main.notification_preferences'), async (ctx: Context): Promise<true | Message.TextMessage> => {
      return new ShowNotificationPreferencesAction().run(ctx);
    });
  }
}