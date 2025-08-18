import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { ChooseDateMessage } from '../../messages/booking/choose-date.message';
import { ShowChooseCourtAction } from './show-choose-court.action';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ShowChooseDateAction {
  constructor(
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction
  ) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    if (!ctx.session.bookingData?.courtId) {
      return this.showChooseCourtAction.run(ctx, reply);
    }

    const dateSlots = this.bookingSlotService.generateDateSlots().map(date => date.toDate());

    if (reply) {
      return ChooseDateMessage.reply(ctx, dateSlots);
    }

    return ChooseDateMessage.editMessageText(ctx, dateSlots);
  }
}