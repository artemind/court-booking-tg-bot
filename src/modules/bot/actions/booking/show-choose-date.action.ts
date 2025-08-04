import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { ChooseDateMessage } from '../../messages/booking/choose-date.message';

export class ShowChooseDateAction {
  constructor(private bookingSlotService: BookingSlotService) {
  }

  async run(ctx: Context): Promise<true | Message.TextMessage> {
    const dateSlots = this.bookingSlotService.generateDateSlots().map(date => date.toDate());

    return ChooseDateMessage.editMessageText(ctx, dateSlots);
  }
}