import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BookingFormatter } from '../../../src/bot/formatters/booking.formatter';
import type { Booking, Court } from '../../../src/generated/prisma';
import type { I18nContext } from '@edjopato/telegraf-i18n';

const FIXED_TODAY = '2026-05-10T12:00:00.000Z';

const fakeCourt: Court = {
  id: 1,
  name: 'Centre Court',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeBooking(dateFrom: string, dateTill: string): Booking & { court: Court } {
  return {
    id: 1,
    courtId: 1,
    userId: 1,
    dateFrom: new Date(dateFrom),
    dateTill: new Date(dateTill),
    createdAt: new Date(),
    updatedAt: new Date(),
    court: fakeCourt,
  } as Booking & { court: Court };
}

function makeI18nContext(): I18nContext {
  return { t: vi.fn((key: string) => key), locale: vi.fn().mockReturnValue('en') } as unknown as I18nContext;
}

describe('BookingFormatter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FIXED_TODAY));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('overload with I18nContext (2 args)', () => {
    it('returns all five formatted lines joined by newlines', () => {
      const booking = makeBooking('2026-05-15T08:00:00Z', '2026-05-15T09:30:00Z');
      const result = BookingFormatter.format(makeI18nContext(), booking);
      const lines = result.split('\n');
      expect(lines).toHaveLength(5);
    });

    it('includes court name', () => {
      const booking = makeBooking('2026-05-15T08:00:00Z', '2026-05-15T09:30:00Z');
      const result = BookingFormatter.format(makeI18nContext(), booking);
      expect(result).toContain(fakeCourt.name);
    });

    it("contains '(today)' translation when dateFrom is today", () => {
      // dateFrom is 2026-05-10 — same day as FIXED_TODAY
      const booking = makeBooking('2026-05-10T08:00:00Z', '2026-05-10T09:30:00Z');
      const i18n = makeI18nContext();
      BookingFormatter.format(i18n, booking);
      expect(i18n.t).toHaveBeenCalledWith('today');
    });

    it('includes day-of-week abbreviation when dateFrom is not today', () => {
      const booking = makeBooking('2026-05-15T08:00:00Z', '2026-05-15T09:30:00Z');
      const result = BookingFormatter.format(makeI18nContext(), booking);
      // 2026-05-15 is a Friday → 'Fri'
      expect(result).toContain('Fri');
    });

    it('shows start time in HH:mm format', () => {
      const booking = makeBooking('2026-05-15T08:30:00Z', '2026-05-15T10:00:00Z');
      const result = BookingFormatter.format(makeI18nContext(), booking);
      expect(result).toContain('08:30');
    });

    it('shows end time in HH:mm format', () => {
      const booking = makeBooking('2026-05-15T08:00:00Z', '2026-05-15T10:00:00Z');
      const result = BookingFormatter.format(makeI18nContext(), booking);
      expect(result).toContain('10:00');
    });

    it('shows duration formatted in h:mm', () => {
      // 90 minutes → '1:30'
      const booking = makeBooking('2026-05-15T08:00:00Z', '2026-05-15T09:30:00Z');
      const result = BookingFormatter.format(makeI18nContext(), booking);
      expect(result).toContain('1:30');
    });
  });

  describe('overload with I18n instance + locale (3 args)', () => {
    it('calls i18n.t(locale, key) instead of i18n.t(key)', () => {
      const booking = makeBooking('2026-05-15T08:00:00Z', '2026-05-15T09:30:00Z');
      const i18n = { t: vi.fn((locale: string, key: string) => `${locale}:${key}`) } as any;

      const result = BookingFormatter.format(i18n, booking, 'uk');

      expect(i18n.t).toHaveBeenCalledWith('uk', expect.any(String));
      expect(result).toContain('uk:court');
    });

    it('uses the provided locale for translations', () => {
      const booking = makeBooking('2026-05-15T08:00:00Z', '2026-05-15T09:30:00Z');
      const i18n = { t: vi.fn((locale: string, key: string) => key) } as any;

      BookingFormatter.format(i18n, booking, 'en');

      const locales = i18n.t.mock.calls.map((c: string[]) => c[0]);
      expect(locales.every((l: string) => l === 'en')).toBe(true);
    });
  });
});
