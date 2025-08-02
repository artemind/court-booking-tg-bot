import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { BOOK } from '../../keyboards/main-menu.items';
import { ChooseCourtReply } from '../../replies/booking/choose-court.reply';

export class ChooseCourtHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService
  ) {}

  async register(): Promise<void> {
    this.bot.hears(BOOK, async (ctx: Context): Promise<void> => {
      const courts = await this.courtService.all();
      ChooseCourtReply.reply(ctx, courts);
    });
  }
}