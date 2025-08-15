import * as cron from 'node-cron';
import { ScheduledTask } from 'node-cron';
import { BookingService } from '../services/booking.service';
import dayjs from 'dayjs';
import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { SendNotificationAction } from '../actions/booking/send-notification.action';

export class CronHandler {
  constructor(
    private bot: Telegraf<Context>,
    private bookingService: BookingService
  ) {}

  async register(): Promise<void> {
    await this.scheduleNotifications();
  }

  private async scheduleNotifications(): Promise<ScheduledTask> {
    return cron.schedule('*/15 * * * *', async () => {
      const bookings = await this.bookingService.getBookingsToBeNotified(dayjs(), 30, 15);
      const sendNotificationAction = new SendNotificationAction();
      bookings.forEach(booking => {
        sendNotificationAction.run(this.bot, booking);
      });
    });
  }
}