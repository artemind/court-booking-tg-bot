import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { Booking } from '../../../../generated/prisma';
import { BookingService } from '../../services/booking.service';
import dayjs from 'dayjs';
import { ChooseTimeMessage } from '../../messages/booking/choose-time.message';

export class ShowChooseTimeAction {
  constructor(
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {
  }

  async run(ctx: Context, courtId: number, date: dayjs.Dayjs): Promise<true | Message.TextMessage> {
    const bookings: Booking[] = await this.bookingService.getByDate(courtId, date);
    const timeSlots = this.bookingSlotService.generateAvailableTimeSlots(date, bookings);

    return ChooseTimeMessage.editMessageText(ctx, timeSlots);
  }
}