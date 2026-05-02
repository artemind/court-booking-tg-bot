import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import { ChooseDurationMessage } from '../../../../src/bot/messages/booking/choose-duration.message';
import { createMockContext } from '../../../helpers/create-mock-context';

const availableDurations = [30, 60, 90];

function makeCtx() {
  return createMockContext({
    session: {
      sessionStartsAt: new Date(),
      bookingData: {
        courtId: 1,
        courtName: 'Court A',
        date: dayjs.utc('2026-05-10'),
        dateAndTime: dayjs.utc('2026-05-10T10:00:00Z'),
      },
    },
  });
}

describe('ChooseDurationMessage', () => {
  describe('editMessageText', () => {
    it('calls ctx.answerCbQuery before editing', async () => {
      const ctx = makeCtx();
      await ChooseDurationMessage.editMessageText(ctx, availableDurations);
      expect(ctx.answerCbQuery).toHaveBeenCalled();
    });

    it('calls ctx.editMessageText with choose_duration i18n key in text', async () => {
      const ctx = makeCtx();
      await ChooseDurationMessage.editMessageText(ctx, availableDurations);
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('choose_duration');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = makeCtx();
      await ChooseDurationMessage.editMessageText(ctx, availableDurations);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard', async () => {
      const ctx = makeCtx();
      await ChooseDurationMessage.editMessageText(ctx, availableDurations);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });

  describe('reply', () => {
    it('calls ctx.answerCbQuery before replying', async () => {
      const ctx = makeCtx();
      await ChooseDurationMessage.reply(ctx, availableDurations);
      expect(ctx.answerCbQuery).toHaveBeenCalled();
    });

    it('calls ctx.reply with choose_duration i18n key in text', async () => {
      const ctx = makeCtx();
      await ChooseDurationMessage.reply(ctx, availableDurations);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('choose_duration');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = makeCtx();
      await ChooseDurationMessage.reply(ctx, availableDurations);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard', async () => {
      const ctx = makeCtx();
      await ChooseDurationMessage.reply(ctx, availableDurations);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });
});
