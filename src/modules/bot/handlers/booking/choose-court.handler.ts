import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { CourtNotFoundException } from '../../exceptions/court-not-found.exception';
import { ChooseDateMessage } from '../../messages/booking/choose-date.message';
import { BookingSlotService } from '../../services/booking-slot.service';
import { ChooseCourtMessage } from '../../messages/booking/choose-court.message';

export class ChooseCourtHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingSlotService: BookingSlotService,
  ) {
  }

  async register(): Promise<void> {
    this.bot.action(/^BOOKING_CHOOSE_COURT_(\d+)$/, async (ctx: Context): Promise<void> => {
      const selectedCourt = await this.courtService.findById(parseInt(ctx.match[1] || ''));
      if (!selectedCourt) {
        throw new CourtNotFoundException;
      }
      ctx.session.bookingData = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
      };
      await ChooseDateMessage.editMessageText(ctx, this.bookingSlotService.generateDateSlots().map(date => date.toDate()));
    });
  }

  async show(ctx: Context): Promise<void> {
    const courts = await this.courtService.all();

    return ChooseCourtMessage.reply(ctx, courts);
  }
}