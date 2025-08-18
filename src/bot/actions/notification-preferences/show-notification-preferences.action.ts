import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { NotificationPreferencesKeyboard } from '../../keyboards/notification-preferences.keyboard';
import { injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ShowNotificationPreferencesAction {
  async run(ctx: Context): Promise<Message.TextMessage> {
    const user = ctx.user!;

    return ctx.reply(ctx.i18n.t('notification_preferences'), NotificationPreferencesKeyboard.build(ctx.i18n, user.notifyBeforeBookingStarts, user.notifyBeforeBookingEnds));
  }
}