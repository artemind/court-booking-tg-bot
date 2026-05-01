import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BookingSlotService } from '../../../src/bot/services/booking-slot.service';
import type { Booking } from '../../../src/generated/prisma';

dayjs.extend(utc);
dayjs.extend(timezone);

// Default service config mirroring production defaults
const service = new BookingSlotService('07:00', '23:59', 30, 30, 180);

function makeBooking(fromISO: string, tillISO: string): Booking {
  return { dateFrom: new Date(fromISO), dateTill: new Date(tillISO) } as Booking;
}

// ─────────────────────────────────────────────
// generateTimeSlots
// ─────────────────────────────────────────────
describe('generateTimeSlots', () => {
  it('returns all 30-min slots in 07:00–09:00 range', () => {
    expect(service.generateTimeSlots('07:00', '09:00')).toEqual([
      '07:00', '07:30', '08:00', '08:30', '09:00',
    ]);
  });

  it('stops at 23:30 for 23:00–23:59 range (next slot exceeds boundary)', () => {
    expect(service.generateTimeSlots('23:00', '23:59')).toEqual(['23:00', '23:30']);
  });

  it('returns a single slot when startHour equals endHour', () => {
    expect(service.generateTimeSlots('10:00', '10:00')).toEqual(['10:00']);
  });

  it('steps by 1 hour when slotSize is 60', () => {
    const hourly = new BookingSlotService('07:00', '09:00', 60, 60, 180);
    expect(hourly.generateTimeSlots()).toEqual(['07:00', '08:00', '09:00']);
  });
});

// ─────────────────────────────────────────────
// generateDateSlots
// ─────────────────────────────────────────────
describe('generateDateSlots', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns exactly 7 dates when days = 7', () => {
    expect(service.generateDateSlots(7)).toHaveLength(7);
  });

  it('first date is today', () => {
    const slots = service.generateDateSlots(7);
    expect(slots[0]!.format('YYYY-MM-DD')).toBe('2024-06-01');
  });

  it('last date is today + 6 when days = 7', () => {
    const slots = service.generateDateSlots(7);
    expect(slots[6]!.format('YYYY-MM-DD')).toBe('2024-06-07');
  });

  it('returns only today when days = 1', () => {
    const slots = service.generateDateSlots(1);
    expect(slots).toHaveLength(1);
    expect(slots[0]!.format('YYYY-MM-DD')).toBe('2024-06-01');
  });

  it('every slot is startOf("day") — time is always midnight', () => {
    service.generateDateSlots(7).forEach(slot => {
      expect(slot.hour()).toBe(0);
      expect(slot.minute()).toBe(0);
      expect(slot.second()).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────
// getBookedTimeSlots
// ─────────────────────────────────────────────
describe('getBookedTimeSlots', () => {
  it('returns empty array for no bookings', () => {
    expect(service.getBookedTimeSlots([])).toEqual([]);
  });

  it('returns 4 slots for a 10:00–12:00 booking (dateTill − 1 sec = 11:59)', () => {
    const booking = makeBooking('2024-06-01T10:00:00Z', '2024-06-01T12:00:00Z');
    expect(service.getBookedTimeSlots([booking])).toEqual([
      '10:00', '10:30', '11:00', '11:30',
    ]);
  });

  it('concatenates slots from two adjacent bookings', () => {
    const b1 = makeBooking('2024-06-01T08:00:00Z', '2024-06-01T09:00:00Z');
    const b2 = makeBooking('2024-06-01T10:00:00Z', '2024-06-01T11:00:00Z');
    const result = service.getBookedTimeSlots([b1, b2]);
    expect(result).toContain('08:00');
    expect(result).toContain('08:30');
    expect(result).toContain('10:00');
    expect(result).toContain('10:30');
  });
});

// ─────────────────────────────────────────────
// generateDurations
// ─────────────────────────────────────────────
describe('generateDurations', () => {
  it('returns all 30-min steps from 30 to 180', () => {
    expect(service.generateDurations()).toEqual([30, 60, 90, 120, 150, 180]);
  });

  it('returns a single element when min equals max', () => {
    expect(service.generateDurations(60, 60)).toEqual([60]);
  });

  it('returns empty array when min > max', () => {
    expect(service.generateDurations(120, 60)).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// generateAvailableTimeSlots
// ─────────────────────────────────────────────
describe('generateAvailableTimeSlots', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const tomorrow = dayjs.utc('2024-06-02').startOf('day');
  const today    = dayjs.utc('2024-06-01').startOf('day');

  it('returns all slots from 07:00 for a future date with no bookings', () => {
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
    const slots = service.generateAvailableTimeSlots(tomorrow, []);
    expect(slots[0]).toBe('07:00');
    expect(slots).toContain('23:30');
  });

  it('rounds current time UP to next slot: now=10:10 → starts at 10:30', () => {
    vi.setSystemTime(new Date('2024-06-01T10:10:00Z'));
    const slots = service.generateAvailableTimeSlots(today, []);
    expect(slots[0]).toBe('10:30');
    expect(slots).not.toContain('10:00');
  });

  it('now=10:30 exactly → starts at 11:00 (slot already started)', () => {
    vi.setSystemTime(new Date('2024-06-01T10:30:00Z'));
    const slots = service.generateAvailableTimeSlots(today, []);
    expect(slots[0]).toBe('11:00');
    expect(slots).not.toContain('10:30');
  });

  it('now=23:45 → returns empty (no slots left today)', () => {
    vi.setSystemTime(new Date('2024-06-01T23:45:00Z'));
    const slots = service.generateAvailableTimeSlots(today, []);
    expect(slots).toEqual([]);
  });

  it('excludes booked slots: booking 10:00–11:00 removes 10:00 and 10:30', () => {
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
    const booking = makeBooking('2024-06-02T10:00:00Z', '2024-06-02T11:00:00Z');
    const slots = service.generateAvailableTimeSlots(tomorrow, [booking]);
    expect(slots).not.toContain('10:00');
    expect(slots).not.toContain('10:30');
    expect(slots).toContain('11:00');
  });

  it('booking at start of day removes first slots', () => {
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
    const booking = makeBooking('2024-06-02T07:00:00Z', '2024-06-02T08:00:00Z');
    const slots = service.generateAvailableTimeSlots(tomorrow, [booking]);
    expect(slots).not.toContain('07:00');
    expect(slots).not.toContain('07:30');
    expect(slots).toContain('08:00');
  });

  it('booking at end of day removes last slots', () => {
    vi.setSystemTime(new Date('2024-06-01T00:00:00Z'));
    const booking = makeBooking('2024-06-02T23:00:00Z', '2024-06-02T23:59:59Z');
    const slots = service.generateAvailableTimeSlots(tomorrow, [booking]);
    expect(slots).not.toContain('23:00');
    expect(slots).not.toContain('23:30');
  });
});

// ─────────────────────────────────────────────
// generateAvailableDurations
// ─────────────────────────────────────────────
describe('generateAvailableDurations', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns [] when startTime is more than slotSize in the past (today)', () => {
    vi.setSystemTime(new Date('2024-06-01T10:30:00Z'));
    const pastStart = dayjs.utc('2024-06-01T09:00:00');
    expect(service.generateAvailableDurations(pastStart, [])).toEqual([]);
  });

  it('returns all durations when startTime is future and no bookings', () => {
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
    const futureStart = dayjs.utc('2024-06-02T07:00:00');
    expect(service.generateAvailableDurations(futureStart, [])).toEqual([30, 60, 90, 120, 150, 180]);
  });

  it('booking 12:00–13:00 with startTime=11:00 allows 30 and 60 min only', () => {
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
    const start   = dayjs.utc('2024-06-02T11:00:00');
    const booking = makeBooking('2024-06-02T12:00:00Z', '2024-06-02T13:00:00Z');
    expect(service.generateAvailableDurations(start, [booking])).toEqual([30, 60]);
  });

  it('startTime=23:30 → only 30 min fits before end of day (23:59)', () => {
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
    const start = dayjs.utc('2024-06-02T23:30:00');
    expect(service.generateAvailableDurations(start, [])).toEqual([30]);
  });

  it('startTime=23:00 → only 30 and 60 min fit before end of day', () => {
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
    const start = dayjs.utc('2024-06-02T23:00:00');
    expect(service.generateAvailableDurations(start, [])).toEqual([30, 60]);
  });

  it('booking ending exactly at startTime does not block any duration', () => {
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
    const start   = dayjs.utc('2024-06-02T11:00:00');
    // booking dateTill == startTime → isBefore(bookingEnd) is false → no conflict
    const booking = makeBooking('2024-06-02T10:00:00Z', '2024-06-02T11:00:00Z');
    const result  = service.generateAvailableDurations(start, [booking]);
    expect(result).toContain(30);
    expect(result).toContain(60);
  });

  it('slot ending exactly at booking dateFrom does not block (strict isAfter)', () => {
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
    const start   = dayjs.utc('2024-06-02T11:00:00');
    // 30-min slot ends at 11:30, booking starts at 11:30 → endTime.isAfter(bookingStart) is false
    const booking = makeBooking('2024-06-02T11:30:00Z', '2024-06-02T12:30:00Z');
    const result  = service.generateAvailableDurations(start, [booking]);
    expect(result).toContain(30);
    expect(result).not.toContain(60); // 60-min ends at 12:00 > 11:30 → blocked
  });
});
