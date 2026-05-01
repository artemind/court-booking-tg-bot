import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../../src/bot/context.manager';
import { createMockContext } from '../helpers/create-mock-context';
import type { Context } from '../../src/bot/context';
import dayjs from 'dayjs';

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
          dateAndTime: dayjs('2024-06-01T10:00:00Z'),
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
    it('removes time and dateAndTime', () => {
      ContextManager.clearTimeSelection(ctx);
      expect(ctx.session.bookingData).not.toHaveProperty('time');
      expect(ctx.session.bookingData).not.toHaveProperty('dateAndTime');
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
    it('removes date, time, and dateAndTime', () => {
      ContextManager.clearDateSelection(ctx);
      expect(ctx.session.bookingData).not.toHaveProperty('date');
      expect(ctx.session.bookingData).not.toHaveProperty('time');
      expect(ctx.session.bookingData).not.toHaveProperty('dateAndTime');
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
});
