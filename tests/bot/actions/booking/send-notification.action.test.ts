import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dayjs from 'dayjs';
import { SendNotificationAction } from '../../../../src/bot/actions/booking/send-notification.action';
import { BookingFormatter } from '../../../../src/bot/formatters/booking.formatter';
import type { NotifiableBooking } from '../../../../src/bot/services/booking.service';
import type { Court } from '../../../../src/generated/prisma';

const FIXED_NOW = '2026-05-10T10:00:00.000Z';

const fakeBookingBase = {
  id: 1,
  courtId: 1,
  userId: 1,
  notifiedBeforeStartAt: null,
  notifiedBeforeEndAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  court: { id: 1, name: 'Court A' } as Court,
  user: { telegramId: BigInt(123456), languageCode: 'en' },
} as unknown as NotifiableBooking;

function bookingAt(startOffsetMinutes: number, endOffsetMinutes: number): NotifiableBooking {
  return {
    ...fakeBookingBase,
    dateFrom: dayjs.utc(FIXED_NOW).add(startOffsetMinutes, 'minutes').toDate(),
    dateTill: dayjs.utc(FIXED_NOW).add(endOffsetMinutes, 'minutes').toDate(),
  };
}

function makeAction(defaultLocale = 'en') {
  const i18n = { t: vi.fn((locale: string, key: string) => `${locale}:${key}`) } as any;
  const action = new SendNotificationAction(i18n, defaultLocale);
  return { action, i18n };
}

function makeBot() {
  return {
    telegram: {
      sendMessage: vi.fn().mockResolvedValue({ message_id: 42 }),
    },
  } as any;
}

describe('SendNotificationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FIXED_NOW));
    vi.spyOn(BookingFormatter, 'format').mockReturnValue('formatted booking text');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('booking start notification', () => {
    it('sends a message and returns it', async () => {
      const { action } = makeAction();
      const bot = makeBot();

      const result = await action.run(bot, bookingAt(30, 90), 'start');

      expect(bot.telegram.sendMessage).toHaveBeenCalledOnce();
      expect(result).toEqual({ message_id: 42 });
    });

    it('uses the before_booking_starts key with the remaining minutes', async () => {
      const { action, i18n } = makeAction();
      const bot = makeBot();

      await action.run(bot, bookingAt(30, 90), 'start');

      expect(i18n.t).toHaveBeenCalledWith('en', 'notifications.before_booking_starts', { minutes: 30 });
      const [, message] = bot.telegram.sendMessage.mock.calls[0]!;
      expect(message).toContain('notifications.before_booking_starts');
    });

    it('reports the real remaining minutes when delivered late', async () => {
      const { action, i18n } = makeAction();
      const bot = makeBot();

      // Lead time is 30 min but the tick ran 8 minutes late.
      await action.run(bot, bookingAt(22, 82), 'start');

      expect(i18n.t).toHaveBeenCalledWith('en', 'notifications.before_booking_starts', { minutes: 22 });
    });
  });

  describe('booking end notification', () => {
    it('uses the before_booking_ends key with the remaining minutes', async () => {
      const { action, i18n } = makeAction();
      const bot = makeBot();

      await action.run(bot, bookingAt(-30, 15), 'end');

      expect(i18n.t).toHaveBeenCalledWith('en', 'notifications.before_booking_ends', { minutes: 15 });
      const [, message] = bot.telegram.sendMessage.mock.calls[0]!;
      expect(message).toContain('notifications.before_booking_ends');
    });

    it('does not fall back to the start wording once the booking has begun', async () => {
      const { action, i18n } = makeAction();
      const bot = makeBot();

      await action.run(bot, bookingAt(-30, 15), 'end');

      expect(i18n.t).not.toHaveBeenCalledWith('en', 'notifications.before_booking_starts', expect.anything());
    });
  });

  describe('clock edge cases', () => {
    it('never reports negative minutes', async () => {
      const { action, i18n } = makeAction();
      const bot = makeBot();

      await action.run(bot, bookingAt(-60, -30), 'end');

      expect(i18n.t).toHaveBeenCalledWith('en', 'notifications.before_booking_ends', { minutes: 0 });
      expect(bot.telegram.sendMessage).toHaveBeenCalledOnce();
    });
  });

  describe('language handling', () => {
    it("uses user's languageCode when present", async () => {
      const { action, i18n } = makeAction('en');
      const bot = makeBot();
      const booking = { ...bookingAt(30, 90), user: { telegramId: BigInt(123456), languageCode: 'uk' } };

      await action.run(bot, booking, 'start');

      expect(i18n.t).toHaveBeenCalledWith('uk', expect.any(String), expect.any(Object));
    });

    it('falls back to default locale when user languageCode is null', async () => {
      const { action, i18n } = makeAction('en');
      const bot = makeBot();
      const booking = { ...bookingAt(30, 90), user: { telegramId: BigInt(123456), languageCode: null } };

      await action.run(bot, booking, 'start');

      expect(i18n.t).toHaveBeenCalledWith('en', expect.any(String), expect.any(Object));
    });

    it('sends message to user telegramId', async () => {
      const { action } = makeAction();
      const bot = makeBot();
      const booking = { ...bookingAt(30, 90), user: { telegramId: BigInt(999888), languageCode: 'en' } };

      await action.run(bot, booking, 'start');

      const [telegramId] = bot.telegram.sendMessage.mock.calls[0]!;
      expect(telegramId).toBe('999888');
    });
  });
});
