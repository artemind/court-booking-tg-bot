import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { BOOK } from '../../keyboards/main-menu.items';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import type { Message } from 'telegraf/types';

export class StartBookingHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(BOOK, async (ctx: Context): Promise<true | Message.TextMessage> => {
      return new ShowChooseCourtAction(this.courtService).run(ctx, true);
    });
  }
}