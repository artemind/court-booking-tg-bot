import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { CancelMyBookingHandler } from '../../../../src/bot/handlers/my-bookings/cancel-my-booking.handler';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { Booking, User } from '../../../../src/generated/prisma';

const fakeUser: User = {
  id: 7,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Test',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const futureBooking: Booking = {
  id: 42,
  courtId: 1,
  userId: fakeUser.id,
  dateFrom: new Date(dayjs().add(2, 'hours').toISOString()),
  dateTill: new Date(dayjs().add(3, 'hours').toISOString()),
  createdAt: new Date(),
  updatedAt: new Date(),
} as Booking;

const pastBooking: Booking = {
  ...futureBooking,
  dateFrom: new Date('2020-01-01T10:00:00Z'),
  dateTill: new Date('2020-01-01T11:00:00Z'),
};

const otherUserBooking: Booking = {
  ...futureBooking,
  userId: 999,
};

function makeHandler() {
  const actions: Array<{ pattern: string | RegExp; cb: Function }> = [];
  const bot = { action: vi.fn((p, cb) => actions.push({ pattern: p, cb })) };

  const bookingService = {
    findById: vi.fn(),
    deleteById: vi.fn().mockResolvedValue(futureBooking),
  };
  const showMyBookingsAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new CancelMyBookingHandler(
    bot as any,
    bookingService as any,
    showMyBookingsAction as any,
  );

  const getCb = () => actions[0]!.cb;

  return { handler, bot, bookingService, showMyBookingsAction, getCb };
}

function ctxWithBookingId(id: string) {
  return createMockContext({
    user: fakeUser,
    match: ['', id] as unknown as RegExpExecArray,
  });
}

describe('CancelMyBookingHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers one action on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.action).toHaveBeenCalledOnce();
    expect(bot.action.mock.calls[0]![0]).toEqual(/^CANCEL_MY_BOOKING_(\d+)$/);
  });

  describe('action callback', () => {
    it('calls editMessageText with booking_not_found when booking does not exist', async () => {
      const { handler, bookingService, getCb } = makeHandler();
      await handler.register();
      bookingService.findById.mockResolvedValue(null);

      const ctx = ctxWithBookingId('42');
      await getCb()(ctx);

      expect(ctx.editMessageText).toHaveBeenCalledWith('errors.booking_not_found');
      expect(bookingService.deleteById).not.toHaveBeenCalled();
    });

    it('calls editMessageText with not_authorized when booking belongs to another user', async () => {
      const { handler, bookingService, getCb } = makeHandler();
      await handler.register();
      bookingService.findById.mockResolvedValue(otherUserBooking);

      const ctx = ctxWithBookingId('42');
      await getCb()(ctx);

      expect(ctx.editMessageText).toHaveBeenCalledWith('errors.not_authorized_to_cancel_booking');
      expect(bookingService.deleteById).not.toHaveBeenCalled();
    });

    it('calls editMessageText with not_authorized when booking is already past', async () => {
      const { handler, bookingService, getCb } = makeHandler();
      await handler.register();
      bookingService.findById.mockResolvedValue(pastBooking);

      const ctx = ctxWithBookingId('42');
      await getCb()(ctx);

      expect(ctx.editMessageText).toHaveBeenCalledWith('errors.not_authorized_to_cancel_booking');
      expect(bookingService.deleteById).not.toHaveBeenCalled();
    });

    it('calls bookingService.deleteById with the booking id on valid cancellation', async () => {
      const { handler, bookingService, getCb } = makeHandler();
      await handler.register();
      bookingService.findById.mockResolvedValue(futureBooking);

      await getCb()(ctxWithBookingId('42'));

      expect(bookingService.deleteById).toHaveBeenCalledWith(42);
    });

    it('calls showMyBookingsAction.run(ctx, false) after cancellation', async () => {
      const { handler, bookingService, showMyBookingsAction, getCb } = makeHandler();
      await handler.register();
      bookingService.findById.mockResolvedValue(futureBooking);

      const ctx = ctxWithBookingId('42');
      await getCb()(ctx);

      expect(showMyBookingsAction.run).toHaveBeenCalledWith(ctx, false);
    });

    it('sends booking_cancelled confirmation message after cancellation', async () => {
      const { handler, bookingService, getCb } = makeHandler();
      await handler.register();
      bookingService.findById.mockResolvedValue(futureBooking);

      const ctx = ctxWithBookingId('42');
      await getCb()(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('booking_cancelled');
    });

    it('shows booking_not_found without calling findById when match[1] is undefined', async () => {
      const { handler, bookingService, getCb } = makeHandler();
      await handler.register();

      const ctx = createMockContext({
        user: fakeUser,
        match: [''] as unknown as RegExpExecArray,
      });
      await getCb()(ctx);

      expect(bookingService.findById).not.toHaveBeenCalled();
      expect(ctx.editMessageText).toHaveBeenCalledWith('errors.booking_not_found');
    });
  });
});
