import { Markup } from 'telegraf';
import { I18nContext } from '@edjopato/telegraf-i18n';

export class MainMenuKeyboard {
  static build(i18n: I18nContext) {
    return Markup.keyboard([
      [i18n.t('keyboards.main.book')],
      [i18n.t('keyboards.main.my_bookings'), i18n.t('keyboards.main.notification_preferences')],
    ])
      .resize()
      .oneTime(false);
  }
}