import { describe, it, expect, vi } from 'vitest';
import { NotificationPreferencesKeyboard } from '../../../src/bot/keyboards/notification-preferences.keyboard';
import type { I18nContext } from '@edjopato/telegraf-i18n';

function makeI18n(): I18nContext {
  return { t: vi.fn((key: string) => key), locale: vi.fn().mockReturnValue('en') } as unknown as I18nContext;
}

function getNotificationButtons(i18n: I18nContext): string[] {
  const calls = (i18n.t as ReturnType<typeof vi.fn>).mock.calls.map((c: string[]) => c[0]!);
  return calls;
}

describe('NotificationPreferencesKeyboard', () => {
  it('returns a keyboard markup object', () => {
    const result = NotificationPreferencesKeyboard.build(makeI18n(), true, true);
    expect(result).toBeDefined();
    expect(result.reply_markup).toBeDefined();
  });

  describe('notify before booking starts button', () => {
    it('uses the "enabled" i18n key when beforeStart=true', () => {
      const i18n = makeI18n();
      NotificationPreferencesKeyboard.build(i18n, true, false);
      const keys = getNotificationButtons(i18n);
      expect(keys).toContain('keyboards.notification_preferences.notify_before_booking_starts_enabled');
      expect(keys).not.toContain('keyboards.notification_preferences.notify_before_booking_starts_disabled');
    });

    it('uses the "disabled" i18n key when beforeStart=false', () => {
      const i18n = makeI18n();
      NotificationPreferencesKeyboard.build(i18n, false, true);
      const keys = getNotificationButtons(i18n);
      expect(keys).toContain('keyboards.notification_preferences.notify_before_booking_starts_disabled');
      expect(keys).not.toContain('keyboards.notification_preferences.notify_before_booking_starts_enabled');
    });
  });

  describe('notify before booking ends button', () => {
    it('uses the "enabled" i18n key when beforeEnd=true', () => {
      const i18n = makeI18n();
      NotificationPreferencesKeyboard.build(i18n, false, true);
      const keys = getNotificationButtons(i18n);
      expect(keys).toContain('keyboards.notification_preferences.notify_before_booking_ends_enabled');
      expect(keys).not.toContain('keyboards.notification_preferences.notify_before_booking_ends_disabled');
    });

    it('uses the "disabled" i18n key when beforeEnd=false', () => {
      const i18n = makeI18n();
      NotificationPreferencesKeyboard.build(i18n, true, false);
      const keys = getNotificationButtons(i18n);
      expect(keys).toContain('keyboards.notification_preferences.notify_before_booking_ends_disabled');
      expect(keys).not.toContain('keyboards.notification_preferences.notify_before_booking_ends_enabled');
    });
  });

  it('includes main menu key in every configuration', () => {
    const i18n = makeI18n();
    NotificationPreferencesKeyboard.build(i18n, true, true);
    const keys = getNotificationButtons(i18n);
    expect(keys).toContain('keyboards.main_menu');
  });

  it('all four combinations produce a keyboard', () => {
    const configs: [boolean, boolean][] = [[true, true], [true, false], [false, true], [false, false]];
    for (const [start, end] of configs) {
      const result = NotificationPreferencesKeyboard.build(makeI18n(), start, end);
      expect(result.reply_markup).toBeDefined();
    }
  });
});
