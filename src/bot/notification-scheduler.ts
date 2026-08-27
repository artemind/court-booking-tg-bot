import * as cron from 'node-cron';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import { Telegraf } from 'telegraf';
import dayjs from 'dayjs';
import { Context } from './context';
import { BookingService } from './services/booking.service';
import type { PendingNotification } from './services/booking.service';
import { SendNotificationAction } from './actions/booking/send-notification.action';
import { BOOKING_CONFIG_TOKEN } from '../config/booking.config';
import type { IBookingConfig } from '../config/booking.config';

/**
 * Runs every minute. The lead times are configurable and need not align with any coarser
 * interval, so the scheduler ticks at the finest granularity the notifications use.
 */
export const NOTIFICATION_CRON_EXPRESSION = '* * * * *';

@injectable()
@provide()
export class NotificationScheduler {
  private task: cron.ScheduledTask | null = null;

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
    this.task = cron.schedule(NOTIFICATION_CRON_EXPRESSION, () => this.tick());
  }

  stop(): void {
    this.task?.stop();
    this.task = null;
  }

  async tick(): Promise<void> {
    let pending: PendingNotification[];
    try {
      pending = await this.bookingService.getBookingsToBeNotified(
        dayjs(),
        this.config.minutesBeforeStartNotification,
        this.config.minutesBeforeEndNotification,
      );
    } catch (error) {
      console.error('Failed to load due booking notifications', error);
      return;
    }

    const results = await Promise.allSettled(
      pending.map(notification => this.deliver(notification)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const { kind, booking } = pending[index]!;
        console.error(`Failed to send "${kind}" notification for booking ${booking.id}`, result.reason);
      }
    });
  }

  /**
   * Claims the notification before sending so a restart or a second instance cannot deliver it
   * twice; releases the claim on failure so it is retried on a later tick.
   */
  private async deliver({ kind, booking }: PendingNotification): Promise<void> {
    const claimed = await this.bookingService.claimNotification(booking.id, kind, new Date());
    if (!claimed) {
      return;
    }

    try {
      await this.sendNotificationAction.run(this.bot, booking, kind);
    } catch (error) {
      await this.bookingService.releaseNotification(booking.id, kind).catch(releaseError => {
        console.error(`Failed to release "${kind}" notification claim for booking ${booking.id}`, releaseError);
      });
      throw error;
    }
  }
}
