import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { CourtNotFoundException } from '../../exceptions/court-not-found.exception';
import type { Message } from 'telegraf/types';
import { ShowChooseDateAction } from '../../actions/booking/show-choose-date.action';
import { inject, injectable } from 'inversify';
import { IHandler } from '../handler.interface';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ChooseCourtHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(CourtService)
    private courtService: CourtService,
    @inject(ShowChooseDateAction)
    private showChooseDateAction: ShowChooseDateAction,
  ) {
  }

  async register(): Promise<void> {
    this.bot.action(/^BOOKING_CHOOSE_COURT_(\d+)$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      const selectedCourt = await this.courtService.findById(parseInt(ctx.match[1] || ''));
      if (!selectedCourt) {
        throw new CourtNotFoundException(ctx.i18n);
      }
      ctx.session.bookingData = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
      };

      return this.showChooseDateAction.run(ctx, false);
    });
  }
}