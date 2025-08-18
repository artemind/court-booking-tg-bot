import { Markup } from 'telegraf';
import { I18nContext } from '@edjopato/telegraf-i18n';

export class NotificationPreferencesKeyboard {
  static build(i18n: I18nContext, beforeStartBookingEnabled: boolean, beforeEndBookingEnabled: boolean) {
    const notificationButtons: string[] = [];
    if (beforeStartBookingEnabled) {
      notificationButtons.push(i18n.t('keyboards.notification_preferences.notify_before_booking_starts_enabled'));
    } else {
      notificationButtons.push(i18n.t('keyboards.notification_preferences.notify_before_booking_starts_disabled'));
    }

    if (beforeEndBookingEnabled) {
      notificationButtons.push(i18n.t('keyboards.notification_preferences.notify_before_booking_ends_enabled'));
    } else {
      notificationButtons.push(i18n.t('keyboards.notification_preferences.notify_before_booking_ends_disabled'));
    }

    return Markup.keyboard([
      notificationButtons,
      [i18n.t('keyboards.main_menu')],
    ])
      .resize()
      .oneTime(false);
  }
}