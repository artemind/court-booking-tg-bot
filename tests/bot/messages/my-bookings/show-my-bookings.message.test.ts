import { describe, it, expect, vi } from 'vitest';
import { ShowMyBookingsMessage } from '../../../../src/bot/messages/my-bookings/show-my-bookings.message';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { Booking, Court } from '../../../../src/generated/prisma';

const fakeCourt: Court = {
  id: 1,
  name: 'Court A',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeBooking: Booking & { court: Court } = {
  id: 10,
  courtId: fakeCourt.id,
  userId: 7,
  dateFrom: new Date('2026-05-10T10:00:00Z'),
  dateTill: new Date('2026-05-10T11:00:00Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
  court: fakeCourt,
};

describe('ShowMyBookingsMessage', () => {
  describe('reply', () => {
    it('uses booking_list_is_empty key when bookings list is empty', async () => {
      const ctx = createMockContext();
      await ShowMyBookingsMessage.reply(ctx, []);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('booking_list_is_empty');
    });

    it('uses my_bookings key when list is non-empty', async () => {
      const ctx = createMockContext();
      await ShowMyBookingsMessage.reply(ctx, [fakeBooking]);
      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('my_bookings');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = createMockContext();
      await ShowMyBookingsMessage.reply(ctx, [fakeBooking]);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard', async () => {
      const ctx = createMockContext();
      await ShowMyBookingsMessage.reply(ctx, [fakeBooking]);
      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });

  describe('editMessageText', () => {
    it('uses booking_list_is_empty key when bookings list is empty', async () => {
      const ctx = createMockContext();
      await ShowMyBookingsMessage.editMessageText(ctx, []);
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('booking_list_is_empty');
    });

    it('uses my_bookings key when list is non-empty', async () => {
      const ctx = createMockContext();
      await ShowMyBookingsMessage.editMessageText(ctx, [fakeBooking]);
      const [text] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('my_bookings');
    });

    it('passes Markdown parse_mode', async () => {
      const ctx = createMockContext();
      await ShowMyBookingsMessage.editMessageText(ctx, [fakeBooking]);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes inline keyboard', async () => {
      const ctx = createMockContext();
      await ShowMyBookingsMessage.editMessageText(ctx, [fakeBooking]);
      const [, opts] = (ctx.editMessageText as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });
});
