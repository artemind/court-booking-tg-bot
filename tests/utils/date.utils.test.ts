import { describe, it, expect, afterEach, vi } from 'vitest';
import { formatDate } from '../../src/utils/date.utils';

// 2024-01-01 was a Monday; use noon to avoid any timezone edge-case
const MONDAY = new Date('2024-01-01T12:00:00');

describe('formatDate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('includes short weekday and month name for en locale', () => {
    const result = formatDate(MONDAY, 'en');
    expect(result).toContain('Mon');
    expect(result).toContain('Jan');
  });

  it('includes Ukrainian short weekday for uk locale', () => {
    const result = formatDate(MONDAY, 'uk');
    // Monday in Ukrainian: пн, January: січ.
    expect(result).toContain('пн');
    expect(result).toContain('січ');
  });

  it('falls back to APP_LOCALE env when locale is omitted', () => {
    vi.stubEnv('APP_LOCALE', 'uk');
    const result = formatDate(MONDAY);
    expect(result).toContain('пн');
  });

  it('falls back to en when neither locale nor APP_LOCALE are set', () => {
    vi.stubEnv('APP_LOCALE', '');
    const result = formatDate(MONDAY);
    expect(result).toContain('Mon');
  });
});
