import { describe, it, expect } from 'vitest';
import { formatMinutes } from '../../src/utils/time.utils';

describe('formatMinutes', () => {
  it('formats 30 minutes as 0:30', () => {
    expect(formatMinutes(30)).toBe('0:30');
  });

  it('formats 60 minutes as 1:00', () => {
    expect(formatMinutes(60)).toBe('1:00');
  });

  it('formats 90 minutes as 1:30', () => {
    expect(formatMinutes(90)).toBe('1:30');
  });

  it('formats 180 minutes as 3:00', () => {
    expect(formatMinutes(180)).toBe('3:00');
  });

  it('pads single-digit minutes with leading zero: 5 → 0:05', () => {
    expect(formatMinutes(5)).toBe('0:05');
  });

  it('pads single-digit minutes with leading zero when hours > 0: 125 → 2:05', () => {
    expect(formatMinutes(125)).toBe('2:05');
  });
});
