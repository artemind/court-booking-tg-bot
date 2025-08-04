import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { ChooseDateMessage } from '../../messages/booking/choose-date.message';
import { ShowChooseCourtAction } from './show-choose-court.action';
import { CourtService } from '../../services/court.service';

export class ShowChooseDateAction {
  constructor(
    private bookingSlotService: BookingSlotService,
    private courtService: CourtService,
  ) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    if (!ctx.session.bookingData?.courtId) {
      return new ShowChooseCourtAction(this.courtService).run(ctx, reply);
    }

    const dateSlots = this.bookingSlotService.generateDateSlots().map(date => date.toDate());

    if (reply) {
      return ChooseDateMessage.reply(ctx, dateSlots);
    }

    return ChooseDateMessage.editMessageText(ctx, dateSlots);
  }
}