import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { BOOK } from '../../keyboards/main-menu.items';
import { ChooseCourtView } from '../../views/booking/choose-court.view';
import type { Message } from 'telegraf/types';

export class StartBookingHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(BOOK, async (ctx: Context): Promise<Message.TextMessage> => {
      return new ChooseCourtView(this.courtService).show(ctx);
    });
  }
}