import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as nodeCron from 'node-cron';
import { CronHandler } from '../../../src/bot/handlers/cron.handler';
import type { Booking, Court, User } from '../../../src/generated/prisma';

vi.mock('node-cron', () => ({
  schedule: vi.fn(),
}));

const fakeUser: User = {
  id: 7,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Test',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeCourt: Court = {
  id: 1,
  name: 'Court A',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeBooking: Booking & { user: User; court: Court } = {
  id: 10,
  courtId: fakeCourt.id,
  userId: fakeUser.id,
  dateFrom: new Date(),
  dateTill: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  user: fakeUser,
  court: fakeCourt,
};

function makeHandler() {
  const bot = {} as any;
  const bookingService = { getBookingsToBeNotified: vi.fn().mockResolvedValue([fakeBooking]) };
  const sendNotificationAction = { run: vi.fn() };

  const handler = new CronHandler(bot, bookingService as any, sendNotificationAction as any);

  return { handler, bookingService, sendNotificationAction };
}

describe('CronHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (nodeCron.schedule as ReturnType<typeof vi.fn>).mockReturnValue({ stop: vi.fn() });
  });

  it('schedules a cron task with the correct pattern on register', async () => {
    const { handler } = makeHandler();
    await handler.register();
    expect(nodeCron.schedule).toHaveBeenCalledOnce();
    expect((nodeCron.schedule as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toBe('*/15 * * * *');
  });

  describe('scheduled callback', () => {
    async function runScheduledCallback(handler: CronHandler) {
      await handler.register();
      const scheduledCb = (nodeCron.schedule as ReturnType<typeof vi.fn>).mock.calls[0]![1] as () => Promise<void>;
      await scheduledCb();
    }

    it('calls getBookingsToBeNotified with the correct window params', async () => {
      const { handler, bookingService } = makeHandler();
      await runScheduledCallback(handler);
      expect(bookingService.getBookingsToBeNotified).toHaveBeenCalledOnce();
      const [, minutesBefore, minutesBeforeEnd] = bookingService.getBookingsToBeNotified.mock.calls[0]!;
      expect(minutesBefore).toBe(30);
      expect(minutesBeforeEnd).toBe(15);
    });

    it('calls sendNotificationAction.run for each booking returned', async () => {
      const { handler, bookingService, sendNotificationAction } = makeHandler();
      bookingService.getBookingsToBeNotified.mockResolvedValue([fakeBooking, fakeBooking]);
      await runScheduledCallback(handler);
      expect(sendNotificationAction.run).toHaveBeenCalledTimes(2);
    });

    it('does not call sendNotificationAction.run when no bookings are returned', async () => {
      const { handler, bookingService, sendNotificationAction } = makeHandler();
      bookingService.getBookingsToBeNotified.mockResolvedValue([]);
      await runScheduledCallback(handler);
      expect(sendNotificationAction.run).not.toHaveBeenCalled();
    });
  });
});
