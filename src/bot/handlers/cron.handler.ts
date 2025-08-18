import * as cron from 'node-cron';
import { ScheduledTask } from 'node-cron';
import { BookingService } from '../services/booking.service';
import dayjs from 'dayjs';
import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { SendNotificationAction } from '../actions/booking/send-notification.action';
import { IHandler } from './handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class CronHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(SendNotificationAction)
    private sendNotificationAction: SendNotificationAction,
  ) {}

  async register(): Promise<void> {
    await this.scheduleNotifications();
  }

  private async scheduleNotifications(): Promise<ScheduledTask> {
    return cron.schedule('*/15 * * * *', async () => {
      const bookings = await this.bookingService.getBookingsToBeNotified(dayjs(), 30, 15);
      bookings.forEach(booking => {
        this.sendNotificationAction.run(this.bot, booking);
      });
    });
  }
}