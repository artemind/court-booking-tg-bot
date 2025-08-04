import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { Booking } from '../../../../generated/prisma';
import { BookingService } from '../../services/booking.service';
import { ChooseTimeMessage } from '../../messages/booking/choose-time.message';
import { ShowChooseDateAction } from './show-choose-date.action';
import { CourtService } from '../../services/court.service';

export class ShowChooseTimeAction {
  constructor(
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
    private courtService: CourtService,
  ) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    const courtId = ctx.session.bookingData?.courtId;
    const date = ctx.session.bookingData?.date;
    if (!courtId || !date) {
      return new ShowChooseDateAction(this.bookingSlotService, this.courtService).run(ctx, reply);
    }

    const bookings: Booking[] = await this.bookingService.getByDate(courtId, date);
    const timeSlots = this.bookingSlotService.generateAvailableTimeSlots(date, bookings);

    if (reply) {
      return ChooseTimeMessage.reply(ctx, timeSlots);
    }

    return ChooseTimeMessage.editMessageText(ctx, timeSlots);
  }
}