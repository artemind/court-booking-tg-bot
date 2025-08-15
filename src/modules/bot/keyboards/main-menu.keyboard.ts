import { Markup } from 'telegraf';
import { BOOK, MY_BOOKINGS, NOTIFICATION_PREFERENCES } from './main-menu.items';

export class MainMenuKeyboard {
  static build() {
    return Markup.keyboard([
      [BOOK],
      [MY_BOOKINGS, NOTIFICATION_PREFERENCES],
    ])
      .resize()
      .oneTime(false);
  }
}