import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import { ChooseTimeMessage } from '../../../../src/bot/messages/booking/choose-time.message';
import { createMockContext } from '../../../helpers/create-mock-context';

const availableTimes = ['10:00', '10:30', '11:00'];

function makeCtx() {
  return createMockContext({
    session: {
      sessionStartsAt: new Date(),
      bookingData: {
        courtId: 1,
        courtName: 'Court A',
        date: dayjs.utc('2026-05-10'),
      },
    },
  });
}

describe('ChooseTimeMessage', () => {
  describe('editMessageText', () => {
    it('calls ctx.answerCbQuery before editing', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.editMessageText(ctx, availableTimes);
      expect(ctx.answerCbQuery).toHaveBeenCalled();
    });

    it('uses choose_time i18n key when times are available', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.editMessageText(ctx, availableTimes);
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('choose_time');
    });

    it('uses no_times_available i18n key when list is empty', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.editMessageText(ctx, []);
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('no_times_available');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.editMessageText(ctx, availableTimes);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.editMessageText(ctx, availableTimes);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });

  describe('reply', () => {
    it('calls ctx.answerCbQuery before replying', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.reply(ctx, availableTimes);
      expect(ctx.answerCbQuery).toHaveBeenCalled();
    });

    it('uses choose_time i18n key when times are available', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.reply(ctx, availableTimes);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('choose_time');
    });

    it('uses no_times_available i18n key when list is empty', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.reply(ctx, []);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('no_times_available');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.reply(ctx, availableTimes);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard', async () => {
      const ctx = makeCtx();
      await ChooseTimeMessage.reply(ctx, availableTimes);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });
});
