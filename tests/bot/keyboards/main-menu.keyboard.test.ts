import { describe, it, expect, vi } from 'vitest';
import { MainMenuKeyboard } from '../../../src/bot/keyboards/main-menu.keyboard';
import type { I18nContext } from '@edjopato/telegraf-i18n';

function makeI18n(): I18nContext {
  return { t: vi.fn((key: string) => key), locale: vi.fn().mockReturnValue('en') } as unknown as I18nContext;
}

describe('MainMenuKeyboard', () => {
  it('returns a keyboard markup object', () => {
    const result = MainMenuKeyboard.build(makeI18n());
    expect(result).toBeDefined();
    expect(result.reply_markup).toBeDefined();
  });

  it('uses keyboards.main.book i18n key', () => {
    const i18n = makeI18n();
    MainMenuKeyboard.build(i18n);
    const keys = (i18n.t as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0]);
    expect(keys).toContain('keyboards.main.book');
  });

  it('uses keyboards.main.my_bookings i18n key', () => {
    const i18n = makeI18n();
    MainMenuKeyboard.build(i18n);
    const keys = (i18n.t as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0]);
    expect(keys).toContain('keyboards.main.my_bookings');
  });

  it('uses keyboards.main.notification_preferences i18n key', () => {
    const i18n = makeI18n();
    MainMenuKeyboard.build(i18n);
    const keys = (i18n.t as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0]);
    expect(keys).toContain('keyboards.main.notification_preferences');
  });

  it('produces a reply keyboard (not inline)', () => {
    const result = MainMenuKeyboard.build(makeI18n());
    expect(result.reply_markup).toHaveProperty('keyboard');
  });
});
