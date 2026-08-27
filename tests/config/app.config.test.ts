import { describe, it, expect } from 'vitest';
import { loadAppConfig } from '../../src/config/app.config';

const validEnv = {
  BOT_TOKEN: 'test-token',
};

describe('loadAppConfig', () => {
  it('applies defaults when only required vars are set', () => {
    const config = loadAppConfig(validEnv);

    expect(config).toEqual({
      BOT_TOKEN: 'test-token',
      APP_LOCALE: 'en',
      APP_TIMEZONE: 'UTC',
      BOOKING_AVAILABLE_FROM_TIME: '07:00',
      BOOKING_AVAILABLE_TO_TIME: '23:59',
      BOOKING_SLOT_SIZE_IN_MINUTES: 30,
      BOOKING_MIN_DURATION_MINUTES: 30,
      BOOKING_MAX_DURATION_MINUTES: 180,
      BOOKING_DAYS_AHEAD: 7,
      NOTIFICATION_MINUTES_BEFORE_START: 30,
      NOTIFICATION_MINUTES_BEFORE_END: 15,
    });
  });

  it('parses numeric overrides', () => {
    const config = loadAppConfig({
      ...validEnv,
      BOOKING_SLOT_SIZE_IN_MINUTES: '10',
      BOOKING_DAYS_AHEAD: '14',
    });

    expect(config.BOOKING_SLOT_SIZE_IN_MINUTES).toBe(10);
    expect(config.BOOKING_DAYS_AHEAD).toBe(14);
  });

  it('throws with a readable message when BOT_TOKEN is missing', () => {
    expect(() => loadAppConfig({})).toThrow(/BOT_TOKEN/);
  });

  it('throws when a numeric var is not a number', () => {
    expect(() => loadAppConfig({
      ...validEnv,
      BOOKING_SLOT_SIZE_IN_MINUTES: 'abc',
    })).toThrow(/BOOKING_SLOT_SIZE_IN_MINUTES/);
  });

  it('throws when a time var is not in HH:mm format', () => {
    expect(() => loadAppConfig({
      ...validEnv,
      BOOKING_AVAILABLE_FROM_TIME: '7am',
    })).toThrow(/BOOKING_AVAILABLE_FROM_TIME/);
  });
});
