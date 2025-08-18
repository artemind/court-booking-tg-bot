import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { ShowNotificationPreferencesAction } from '../../actions/notification-preferences/show-notification-preferences.action';
import { match } from '@edjopato/telegraf-i18n';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ShowNotificationPreferencesHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(ShowNotificationPreferencesAction)
    private showNotificationPreferencesAction: ShowNotificationPreferencesAction,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.main.notification_preferences'), async (ctx: Context): Promise<true | Message.TextMessage> => {
      return this.showNotificationPreferencesAction.run(ctx);
    });
  }
}