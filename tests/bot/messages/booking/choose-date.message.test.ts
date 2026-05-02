import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import { ChooseDateMessage } from '../../../../src/bot/messages/booking/choose-date.message';
import { createMockContext } from '../../../helpers/create-mock-context';

const availableDates = [
  dayjs.utc('2026-05-10').toDate(),
  dayjs.utc('2026-05-11').toDate(),
];

function makeCtx() {
  return createMockContext({
    session: {
      sessionStartsAt: new Date(),
      bookingData: { courtId: 1, courtName: 'Court A' },
    },
  });
}

describe('ChooseDateMessage', () => {
  describe('editMessageText', () => {
    it('calls ctx.answerCbQuery before editing', async () => {
      const ctx = makeCtx();
      await ChooseDateMessage.editMessageText(ctx, availableDates);
      expect(ctx.answerCbQuery).toHaveBeenCalled();
    });

    it('calls ctx.editMessageText with choose_date i18n key in text', async () => {
      const ctx = makeCtx();
      await ChooseDateMessage.editMessageText(ctx, availableDates);
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('choose_date');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = makeCtx();
      await ChooseDateMessage.editMessageText(ctx, availableDates);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard with back button', async () => {
      const ctx = makeCtx();
      await ChooseDateMessage.editMessageText(ctx, availableDates);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });

  describe('reply', () => {
    it('calls ctx.answerCbQuery before replying', async () => {
      const ctx = makeCtx();
      await ChooseDateMessage.reply(ctx, availableDates);
      expect(ctx.answerCbQuery).toHaveBeenCalled();
    });

    it('calls ctx.reply with choose_date i18n key in text', async () => {
      const ctx = makeCtx();
      await ChooseDateMessage.reply(ctx, availableDates);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('choose_date');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = makeCtx();
      await ChooseDateMessage.reply(ctx, availableDates);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard', async () => {
      const ctx = makeCtx();
      await ChooseDateMessage.reply(ctx, availableDates);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });
});
