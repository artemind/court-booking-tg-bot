import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { CourtNotFoundException } from '../../exceptions/court-not-found.exception';
import { BookingSlotService } from '../../services/booking-slot.service';
import type { Message } from 'telegraf/types';
import { ShowChooseDateAction } from '../../actions/booking/show-choose-date.action';

export class ChooseCourtHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingSlotService: BookingSlotService,
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

      return new ShowChooseDateAction(this.bookingSlotService, this.courtService).run(ctx, false);
    });
  }
}