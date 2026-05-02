import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dayjs from 'dayjs';
import { SendNotificationAction } from '../../../../src/bot/actions/booking/send-notification.action';
import { BookingFormatter } from '../../../../src/bot/formatters/booking.formatter';
import type { Booking, Court } from '../../../../src/generated/prisma';

const FIXED_NOW = '2026-05-10T10:00:00.000Z';

const fakeBookingBase = {
  id: 1,
  courtId: 1,
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  court: { id: 1, name: 'Court A', createdAt: new Date(), updatedAt: new Date() } as Court,
  user: { telegramId: BigInt(123456), languageCode: 'en' },
} as unknown as Booking & { user: { telegramId: bigint; languageCode: string | null }; court: Court };

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

  describe('booking start notification (30 min before)', () => {
    it('sends a message when now + 30 min equals booking.dateFrom', async () => {
      const { action } = makeAction();
      const bot = makeBot();
      const booking = {
        ...fakeBookingBase,
        dateFrom: new Date(dayjs.utc(FIXED_NOW).add(30, 'minutes').toISOString()),
        dateTill: new Date(dayjs.utc(FIXED_NOW).add(90, 'minutes').toISOString()),
      };

      const result = await action.run(bot, booking);

      expect(bot.telegram.sendMessage).toHaveBeenCalledOnce();
      expect(result).toEqual({ message_id: 42 });
    });

    it('includes before_booking_starts key in the message', async () => {
      const { action } = makeAction();
      const bot = makeBot();
      const booking = {
        ...fakeBookingBase,
        dateFrom: new Date(dayjs.utc(FIXED_NOW).add(30, 'minutes').toISOString()),
        dateTill: new Date(dayjs.utc(FIXED_NOW).add(90, 'minutes').toISOString()),
      };

      await action.run(bot, booking);

      const [, message] = bot.telegram.sendMessage.mock.calls[0]!;
      expect(message).toContain('notifications.before_booking_starts');
    });
  });

  describe('booking end notification (15 min before)', () => {
    it('sends a message when now + 15 min equals booking.dateTill', async () => {
      const { action } = makeAction();
      const bot = makeBot();
      const booking = {
        ...fakeBookingBase,
        dateFrom: new Date(dayjs.utc(FIXED_NOW).subtract(30, 'minutes').toISOString()),
        dateTill: new Date(dayjs.utc(FIXED_NOW).add(15, 'minutes').toISOString()),
      };

      const result = await action.run(bot, booking);

      expect(bot.telegram.sendMessage).toHaveBeenCalledOnce();
      expect(result).toEqual({ message_id: 42 });
    });

    it('includes before_booking_ends key in the message', async () => {
      const { action } = makeAction();
      const bot = makeBot();
      const booking = {
        ...fakeBookingBase,
        dateFrom: new Date(dayjs.utc(FIXED_NOW).subtract(30, 'minutes').toISOString()),
        dateTill: new Date(dayjs.utc(FIXED_NOW).add(15, 'minutes').toISOString()),
      };

      await action.run(bot, booking);

      const [, message] = bot.telegram.sendMessage.mock.calls[0]!;
      expect(message).toContain('notifications.before_booking_ends');
    });
  });

  describe('no notification needed', () => {
    it('returns undefined when neither condition matches', async () => {
      const { action } = makeAction();
      const bot = makeBot();
      const booking = {
        ...fakeBookingBase,
        dateFrom: new Date(dayjs.utc(FIXED_NOW).add(60, 'minutes').toISOString()),
        dateTill: new Date(dayjs.utc(FIXED_NOW).add(120, 'minutes').toISOString()),
      };

      const result = await action.run(bot, booking);

      expect(result).toBeUndefined();
      expect(bot.telegram.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('language handling', () => {
    it("uses user's languageCode when present", async () => {
      const { action, i18n } = makeAction('en');
      const bot = makeBot();
      const booking = {
        ...fakeBookingBase,
        user: { telegramId: BigInt(123456), languageCode: 'uk' },
        dateFrom: new Date(dayjs.utc(FIXED_NOW).add(30, 'minutes').toISOString()),
        dateTill: new Date(dayjs.utc(FIXED_NOW).add(90, 'minutes').toISOString()),
      };

      await action.run(bot, booking);

      expect(i18n.t).toHaveBeenCalledWith('uk', expect.any(String), expect.any(Object));
    });

    it('falls back to default locale when user languageCode is null', async () => {
      const { action, i18n } = makeAction('en');
      const bot = makeBot();
      const booking = {
        ...fakeBookingBase,
        user: { telegramId: BigInt(123456), languageCode: null },
        dateFrom: new Date(dayjs.utc(FIXED_NOW).add(30, 'minutes').toISOString()),
        dateTill: new Date(dayjs.utc(FIXED_NOW).add(90, 'minutes').toISOString()),
      };

      await action.run(bot, booking);

      expect(i18n.t).toHaveBeenCalledWith('en', expect.any(String), expect.any(Object));
    });

    it('sends message to user telegramId', async () => {
      const { action } = makeAction();
      const bot = makeBot();
      const booking = {
        ...fakeBookingBase,
        user: { telegramId: BigInt(999888), languageCode: 'en' },
        dateFrom: new Date(dayjs.utc(FIXED_NOW).add(30, 'minutes').toISOString()),
        dateTill: new Date(dayjs.utc(FIXED_NOW).add(90, 'minutes').toISOString()),
      };

      await action.run(bot, booking);

      const [telegramId] = bot.telegram.sendMessage.mock.calls[0]!;
      expect(telegramId).toBe(999888);
    });
  });
});
