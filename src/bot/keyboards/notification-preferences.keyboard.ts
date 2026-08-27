import { Markup } from 'telegraf';
import { I18nContext } from '@edjopato/telegraf-i18n';

export class NotificationPreferencesKeyboard {
  static build(
    i18n: I18nContext,
    beforeStartBookingEnabled: boolean,
    beforeEndBookingEnabled: boolean,
    minutesBeforeStart: number,
    minutesBeforeEnd: number,
  ) {
    const notificationButtons: string[] = [];
    if (beforeStartBookingEnabled) {
      notificationButtons.push(i18n.t('keyboards.notification_preferences.notify_before_booking_starts_enabled', { minutes: minutesBeforeStart }));
    } else {
      notificationButtons.push(i18n.t('keyboards.notification_preferences.notify_before_booking_starts_disabled', { minutes: minutesBeforeStart }));
    }

    if (beforeEndBookingEnabled) {
      notificationButtons.push(i18n.t('keyboards.notification_preferences.notify_before_booking_ends_enabled', { minutes: minutesBeforeEnd }));
    } else {
      notificationButtons.push(i18n.t('keyboards.notification_preferences.notify_before_booking_ends_disabled', { minutes: minutesBeforeEnd }));
    }

    return Markup.keyboard([
      notificationButtons,
      [i18n.t('keyboards.main_menu')],
    ])
      .resize()
      .oneTime(false);
  }
}