import { vi } from 'vitest';
import type { Context } from '../../src/bot/context';
import type { I18nContext } from '@edjopato/telegraf-i18n';

export function createMockContext(overrides: Partial<Context> = {}): Context {
  const mockI18n = {
    t: vi.fn((key: string) => key),
    locale: vi.fn().mockReturnValue('en'),
  } as unknown as I18nContext;

  return {
    from: {
      id: 123456,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      language_code: 'en',
      is_bot: false,
    },
    session: {
      sessionStartsAt: new Date(),
      bookingData: {},
    },
    i18n: mockI18n,
    match: [] as unknown as RegExpExecArray,
    reply: vi.fn().mockResolvedValue({ message_id: 1 }),
    editMessageText: vi.fn().mockResolvedValue(true),
    answerCbQuery: vi.fn().mockResolvedValue(true),
    deleteMessage: vi.fn().mockResolvedValue(true),
    ...overrides,
  } as unknown as Context;
}
