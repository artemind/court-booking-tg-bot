import * as cron from 'node-cron';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { Context } from './context';
import { BookingService } from './services/booking.service';
import { SendNotificationAction } from './actions/booking/send-notification.action';
import { BOOKING_CONFIG_TOKEN } from '../config/booking.config';
import type { IBookingConfig } from '../config/booking.config';

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
    @inject(BOOKING_CONFIG_TOKEN)
    private config: IBookingConfig,
  ) {}

  start(): void {
    cron.schedule('*/15 * * * *', async () => {
      const bookings = await this.bookingService.getBookingsToBeNotified(
        dayjs(),
        this.config.minutesBeforeStartNotification,
        this.config.minutesBeforeEndNotification,
      );
      await Promise.allSettled(
        bookings.map(booking => this.sendNotificationAction.run(this.bot, booking)),
      );
    });
  }
}
