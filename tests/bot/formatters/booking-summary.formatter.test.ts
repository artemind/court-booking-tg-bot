import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import { BookingSummaryFormatter } from '../../../src/bot/formatters/booking-summary.formatter';
import type { BookingData } from '../../../src/bot/context';
import type { I18nContext } from '@edjopato/telegraf-i18n';

function makeI18n(): I18nContext {
  return { t: vi.fn((key: string) => key), locale: vi.fn().mockReturnValue('en') } as unknown as I18nContext;
}

describe('BookingSummaryFormatter', () => {
  it('returns empty string for null/undefined bookingData', () => {
    expect(BookingSummaryFormatter.format(makeI18n(), null as any)).toBe('');
  });

  it('returns empty string for empty bookingData', () => {
    expect(BookingSummaryFormatter.format(makeI18n(), {})).toBe('');
  });

  it('includes court name when courtName is set', () => {
    const data: BookingData = { courtName: 'Court A' };
    const result = BookingSummaryFormatter.format(makeI18n(), data);
    expect(result).toContain('Court A');
  });

  it('does not include court line when courtName is absent', () => {
    const data: BookingData = { time: '10:00' };
    const result = BookingSummaryFormatter.format(makeI18n(), data);
    expect(result).not.toContain('court');
  });

  it('includes formatted date when date is set', () => {
    const data: BookingData = { date: dayjs.utc('2026-05-15') };
    const result = BookingSummaryFormatter.format(makeI18n(), data);
    expect(result).toContain('15.05.2026');
  });

  it('includes time when time is set', () => {
    const data: BookingData = { time: '10:30' };
    const result = BookingSummaryFormatter.format(makeI18n(), data);
    expect(result).toContain('10:30');
  });

  it('includes end time when dateAndTime and duration are both set', () => {
    const data: BookingData = {
      dateAndTime: dayjs.utc('2026-05-15T10:00:00Z'),
      duration: 90,
    };
    const result = BookingSummaryFormatter.format(makeI18n(), data);
    // 10:00 + 90 min = 11:30 UTC
    expect(result).toContain('11:30');
  });

  it('does not include end time when duration is missing', () => {
    const data: BookingData = { dateAndTime: dayjs.utc('2026-05-15T10:00:00Z') };
    const result = BookingSummaryFormatter.format(makeI18n(), data);
    expect(result).not.toContain('end_time');
  });

  it('includes duration formatted in h:mm when duration is set', () => {
    const data: BookingData = { duration: 90 };
    const result = BookingSummaryFormatter.format(makeI18n(), data);
    expect(result).toContain('1:30');
  });

  it('renders all fields when bookingData is fully populated', () => {
    const data: BookingData = {
      courtName: 'Court A',
      date: dayjs.utc('2026-05-15'),
      time: '10:00',
      dateAndTime: dayjs.utc('2026-05-15T10:00:00Z'),
      duration: 60,
    };
    const result = BookingSummaryFormatter.format(makeI18n(), data);
    expect(result).toContain('Court A');
    expect(result).toContain('15.05.2026');
    expect(result).toContain('10:00');
    expect(result).toContain('11:00');
    expect(result).toContain('1:00');
  });
});
