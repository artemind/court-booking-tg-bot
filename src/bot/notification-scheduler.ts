import * as cron from 'node-cron';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { Context } from './context';
import { BookingService } from './services/booking.service';
import { SendNotificationAction } from './actions/booking/send-notification.action';

@injectable()
@provide()
export class NotificationScheduler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(SendNotificationAction)
    private sendNotificationAction: SendNotificationAction,
  ) {}

  start(): void {
    cron.schedule('*/15 * * * *', async () => {
      const bookings = await this.bookingService.getBookingsToBeNotified(dayjs(), 30, 15);
      await Promise.allSettled(
        bookings.map(booking => this.sendNotificationAction.run(this.bot, booking)),
      );
    });
  }
}
