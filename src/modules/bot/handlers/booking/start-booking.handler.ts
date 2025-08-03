import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { BOOK } from '../../keyboards/main-menu.items';
import { ChooseCourtMessage } from '../../messages/booking/choose-court.message';

export class StartBookingHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService
  ) {}

  async register(): Promise<void> {
    this.bot.hears(BOOK, async (ctx: Context): Promise<void> => {
      this.show(ctx);
    });
  }

  async show(ctx: Context): Promise<void> {
    const courts = await this.courtService.all();
    ChooseCourtMessage.reply(ctx, courts);
  }
}