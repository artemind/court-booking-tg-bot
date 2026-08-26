import { describe, it, expect, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ContextManager } from '../../src/bot/context.manager';
import { createMockContext } from '../helpers/create-mock-context';
import type { Context } from '../../src/bot/context';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('ContextManager', () => {
  let ctx: Context;

  beforeEach(() => {
    ctx = createMockContext({
      session: {
        sessionStartsAt: new Date(),
        bookingData: {
          courtId: 1,
          courtName: 'Court A',
          date: dayjs('2024-06-01'),
          time: '10:00',
          duration: 60,
        },
      },
    });
  });

  describe('resetBookingData', () => {
    it('sets bookingData to an empty object', () => {
      ContextManager.resetBookingData(ctx);
      expect(ctx.session.bookingData).toEqual({});
    });

    it('overwrites all existing booking fields', () => {
      ContextManager.resetBookingData(ctx);
      expect(ctx.session.bookingData).not.toHaveProperty('courtId');
      expect(ctx.session.bookingData).not.toHaveProperty('date');
    });
  });

  describe('clearTimeSelection', () => {
    it('removes time', () => {
      ContextManager.clearTimeSelection(ctx);
      expect(ctx.session.bookingData).not.toHaveProperty('time');
    });

    it('preserves date and other booking fields', () => {
      ContextManager.clearTimeSelection(ctx);
      expect(ctx.session.bookingData?.date).toBeDefined();
      expect(ctx.session.bookingData?.courtId).toBe(1);
      expect(ctx.session.bookingData?.courtName).toBe('Court A');
      expect(ctx.session.bookingData?.duration).toBe(60);
    });
  });

  describe('clearDateSelection', () => {
    it('removes date and time', () => {
      ContextManager.clearDateSelection(ctx);
      expect(ctx.session.bookingData).not.toHaveProperty('date');
      expect(ctx.session.bookingData).not.toHaveProperty('time');
    });

    it('preserves courtId and courtName', () => {
      ContextManager.clearDateSelection(ctx);
      expect(ctx.session.bookingData?.courtId).toBe(1);
      expect(ctx.session.bookingData?.courtName).toBe('Court A');
    });

    it('does nothing when bookingData is undefined', () => {
      ctx.session.bookingData = undefined;
      expect(() => ContextManager.clearDateSelection(ctx)).not.toThrow();
    });
  });

  describe('getDateAndTime', () => {
    it('returns undefined when date is missing', () => {
      ctx.session.bookingData = { time: '10:00' };
      expect(ContextManager.getDateAndTime(ctx)).toBeUndefined();
    });

    it('returns undefined when time is missing', () => {
      ctx.session.bookingData = { date: dayjs.utc('2024-06-01') };
      expect(ContextManager.getDateAndTime(ctx)).toBeUndefined();
    });

    it('returns undefined when bookingData is undefined', () => {
      ctx.session.bookingData = undefined;
      expect(ContextManager.getDateAndTime(ctx)).toBeUndefined();
    });

    it('computes UTC datetime from date and time', () => {
      dayjs.tz.setDefault('UTC');
      ctx.session.bookingData = { date: dayjs.utc('2024-06-01'), time: '10:30' };
      const result = ContextManager.getDateAndTime(ctx)!;
      expect(result.toISOString()).toBe('2024-06-01T10:30:00.000Z');
    });
  });
});
