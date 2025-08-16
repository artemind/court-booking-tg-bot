import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import type { Message } from 'telegraf/types';
import { match } from '@edjopato/telegraf-i18n';

export class StartBookingHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.main.book'), async (ctx: Context): Promise<true | Message.TextMessage> => {
      return new ShowChooseCourtAction(this.courtService).run(ctx, true);
    });
  }
}