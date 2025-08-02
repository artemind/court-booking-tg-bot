import { Markup } from 'telegraf';
import { BOOK, MY_BOOKINGS } from './main-menu.items';

export class MainMenuKeyboard {
  static build() {
    return Markup.keyboard([
      [BOOK, MY_BOOKINGS],
    ])
      .resize()
      .oneTime(false);
  }
}