import { describe, it, expect, vi } from 'vitest';
import { ChooseCourtMessage } from '../../../../src/bot/messages/booking/choose-court.message';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { Court } from '../../../../src/generated/prisma';

const fakeCourts: Court[] = [
  { id: 1, name: 'Court A', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Court B', createdAt: new Date(), updatedAt: new Date() },
];

describe('ChooseCourtMessage', () => {
  describe('reply', () => {
    it('calls ctx.reply with text containing choose_court i18n key', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.reply(ctx, fakeCourts);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('choose_court');
    });

    it('includes numbered court names in the message text', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.reply(ctx, fakeCourts);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('Court A');
      expect(text).toContain('Court B');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.reply(ctx, fakeCourts);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard with court buttons', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.reply(ctx, fakeCourts);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });

    it('works with an empty courts list', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.reply(ctx, []);
      expect(ctx.reply).toHaveBeenCalledOnce();
    });
  });

  describe('editMessageText', () => {
    it('calls ctx.editMessageText with text containing choose_court i18n key', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.editMessageText(ctx, fakeCourts);
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('choose_court');
    });

    it('includes court names in the edited message text', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.editMessageText(ctx, fakeCourts);
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('Court A');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.editMessageText(ctx, fakeCourts);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard', async () => {
      const ctx = createMockContext();
      await ChooseCourtMessage.editMessageText(ctx, fakeCourts);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });
});
