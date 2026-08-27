import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as nodeCron from 'node-cron';
import { NotificationScheduler, NOTIFICATION_CRON_EXPRESSION } from '../../src/bot/notification-scheduler';
import type { IBookingConfig } from '../../src/config/booking.config';
import type { PendingNotification } from '../../src/bot/services/booking.service';

vi.mock('node-cron', () => ({
  schedule: vi.fn(),
}));

const fakeBooking = { id: 10 } as unknown as PendingNotification['booking'];

const startNotification: PendingNotification = { kind: 'start', booking: fakeBooking };
const endNotification: PendingNotification = { kind: 'end', booking: fakeBooking };

const defaultConfig: IBookingConfig = {
  availableFromTime: '07:00',
  availableToTime: '23:59',
  slotSizeMinutes: 30,
  minDurationMinutes: 30,
  maxDurationMinutes: 180,
  daysAhead: 7,
  minutesBeforeStartNotification: 30,
  minutesBeforeEndNotification: 15,
};

function makeScheduler(config: IBookingConfig = defaultConfig) {
  const bot = {} as any;
  const bookingService = {
    getBookingsToBeNotified: vi.fn().mockResolvedValue([startNotification]),
    claimNotification: vi.fn().mockResolvedValue(true),
    releaseNotification: vi.fn().mockResolvedValue(undefined),
  };
  const sendNotificationAction = { run: vi.fn().mockResolvedValue(undefined) };

  const scheduler = new NotificationScheduler(bot, bookingService as any, sendNotificationAction as any, config);

  return { scheduler, bot, bookingService, sendNotificationAction };
}

describe('NotificationScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (nodeCron.schedule as ReturnType<typeof vi.fn>).mockReturnValue({ stop: vi.fn() });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('start / stop', () => {
    it('schedules the task every minute so it does not depend on the slot size', () => {
      const { scheduler } = makeScheduler();
      scheduler.start();

      expect(nodeCron.schedule).toHaveBeenCalledOnce();
      expect((nodeCron.schedule as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toBe('* * * * *');
      expect(NOTIFICATION_CRON_EXPRESSION).toBe('* * * * *');
    });

    it('stops the scheduled task', () => {
      const { scheduler } = makeScheduler();
      const task = { stop: vi.fn() };
      (nodeCron.schedule as ReturnType<typeof vi.fn>).mockReturnValue(task);

      scheduler.start();
      scheduler.stop();

      expect(task.stop).toHaveBeenCalledOnce();
    });

    it('is safe to stop when never started', () => {
      const { scheduler } = makeScheduler();
      expect(() => scheduler.stop()).not.toThrow();
    });
  });

  describe('tick', () => {
    it('passes the configured lead times', async () => {
      const { scheduler, bookingService } = makeScheduler({
        ...defaultConfig,
        minutesBeforeStartNotification: 45,
        minutesBeforeEndNotification: 5,
      });

      await scheduler.tick();

      const [, minutesBeforeStart, minutesBeforeEnd] = bookingService.getBookingsToBeNotified.mock.calls[0]!;
      expect(minutesBeforeStart).toBe(45);
      expect(minutesBeforeEnd).toBe(5);
    });

    it('sends each due notification with its kind', async () => {
      const { scheduler, bot, bookingService, sendNotificationAction } = makeScheduler();
      bookingService.getBookingsToBeNotified.mockResolvedValue([startNotification, endNotification]);

      await scheduler.tick();

      expect(sendNotificationAction.run).toHaveBeenCalledTimes(2);
      expect(sendNotificationAction.run).toHaveBeenNthCalledWith(1, bot, fakeBooking, 'start');
      expect(sendNotificationAction.run).toHaveBeenNthCalledWith(2, bot, fakeBooking, 'end');
    });

    it('does nothing when no notifications are due', async () => {
      const { scheduler, bookingService, sendNotificationAction } = makeScheduler();
      bookingService.getBookingsToBeNotified.mockResolvedValue([]);

      await scheduler.tick();

      expect(sendNotificationAction.run).not.toHaveBeenCalled();
    });

    it('claims the notification before sending it', async () => {
      const { scheduler, bookingService, sendNotificationAction } = makeScheduler();
      const order: string[] = [];
      bookingService.claimNotification.mockImplementation(async () => {
        order.push('claim');
        return true;
      });
      sendNotificationAction.run.mockImplementation(async () => {
        order.push('send');
      });

      await scheduler.tick();

      expect(bookingService.claimNotification).toHaveBeenCalledWith(10, 'start', expect.any(Date));
      expect(order).toEqual(['claim', 'send']);
    });

    it('does not send when the notification was already claimed elsewhere', async () => {
      const { scheduler, bookingService, sendNotificationAction } = makeScheduler();
      bookingService.claimNotification.mockResolvedValue(false);

      await scheduler.tick();

      expect(sendNotificationAction.run).not.toHaveBeenCalled();
    });

    it('releases the claim and logs when delivery fails', async () => {
      const { scheduler, bookingService, sendNotificationAction } = makeScheduler();
      sendNotificationAction.run.mockRejectedValue(new Error('bot blocked'));

      await scheduler.tick();

      expect(bookingService.releaseNotification).toHaveBeenCalledWith(10, 'start');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('booking 10'),
        expect.any(Error),
      );
    });

    it('keeps delivering the remaining notifications when one fails', async () => {
      const { scheduler, bookingService, sendNotificationAction } = makeScheduler();
      bookingService.getBookingsToBeNotified.mockResolvedValue([startNotification, endNotification]);
      sendNotificationAction.run
        .mockRejectedValueOnce(new Error('bot blocked'))
        .mockResolvedValueOnce(undefined);

      await scheduler.tick();

      expect(sendNotificationAction.run).toHaveBeenCalledTimes(2);
    });

    it('logs and returns when loading due notifications fails', async () => {
      const { scheduler, bookingService, sendNotificationAction } = makeScheduler();
      bookingService.getBookingsToBeNotified.mockRejectedValue(new Error('db down'));

      await expect(scheduler.tick()).resolves.toBeUndefined();

      expect(sendNotificationAction.run).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(expect.any(String), expect.any(Error));
    });
  });
});
