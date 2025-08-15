import { Markup } from 'telegraf';
import {
  NOTIFICATION_BEFORE_START_DISABLED,
  NOTIFICATION_BEFORE_START_ENABLED,
  NOTIFICATION_BEFORE_END_ENABLED,
  NOTIFICATION_BEFORE_END_DISABLED
} from './notification-preferences.items';
import { MAIN_MENU } from './main-menu.items';

export class NotificationPreferencesKeyboard {
  static build(beforeStartBookingEnabled: boolean, beforeEndBookingEnabled: boolean) {
    const notificationButtons: string[] = [];
    if (beforeStartBookingEnabled) {
      notificationButtons.push(NOTIFICATION_BEFORE_START_ENABLED);
    } else {
      notificationButtons.push(NOTIFICATION_BEFORE_START_DISABLED);
    }

    if (beforeEndBookingEnabled) {
      notificationButtons.push(NOTIFICATION_BEFORE_END_ENABLED);
    } else {
      notificationButtons.push(NOTIFICATION_BEFORE_END_DISABLED);
    }

    return Markup.keyboard([
      notificationButtons,
      [MAIN_MENU],
    ])
      .resize()
      .oneTime(false);
  }
}