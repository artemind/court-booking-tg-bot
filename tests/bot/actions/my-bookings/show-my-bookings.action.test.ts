import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowMyBookingsAction } from '../../../../src/bot/actions/my-bookings/show-my-bookings.action';
import { ShowMyBookingsMessage } from '../../../../src/bot/messages/my-bookings/show-my-bookings.message';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { Booking, Court, User } from '../../../../src/generated/prisma';

const fakeUser: User = {
  id: 7,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Test User',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeCourt: Court = { id: 1, name: 'Court A', createdAt: new Date(), updatedAt: new Date() };

const fakeBookings: (Booking & { court: Court })[] = [
  {
    id: 10,
    courtId: 1,
    userId: 7,
    dateFrom: new Date('2026-05-15T08:00:00Z'),
    dateTill: new Date('2026-05-15T09:30:00Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    court: fakeCourt,
  } as Booking & { court: Court },
];

function makeAction() {
  const bookingService = {
    getUpcomingByUserId: vi.fn().mockResolvedValue(fakeBookings),
  };
  const action = new ShowMyBookingsAction(bookingService as any);
  return { action, bookingService };
}

describe('ShowMyBookingsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ShowMyBookingsMessage, 'reply').mockResolvedValue({ message_id: 1 } as any);
    vi.spyOn(ShowMyBookingsMessage, 'editMessageText').mockResolvedValue(true);
  });

  it('fetches upcoming bookings for the current user', async () => {
    const { action, bookingService } = makeAction();
    const ctx = createMockContext({ user: fakeUser });
    await action.run(ctx, true);
    expect(bookingService.getUpcomingByUserId).toHaveBeenCalledWith(fakeUser.id);
  });

  it('calls ShowMyBookingsMessage.reply when reply=true', async () => {
    const { action } = makeAction();
    const ctx = createMockContext({ user: fakeUser });
    await action.run(ctx, true);
    expect(ShowMyBookingsMessage.reply).toHaveBeenCalledWith(ctx, fakeBookings);
    expect(ShowMyBookingsMessage.editMessageText).not.toHaveBeenCalled();
  });

  it('calls ShowMyBookingsMessage.editMessageText when reply=false', async () => {
    const { action } = makeAction();
    const ctx = createMockContext({ user: fakeUser });
    await action.run(ctx, false);
    expect(ShowMyBookingsMessage.editMessageText).toHaveBeenCalledWith(ctx, fakeBookings);
    expect(ShowMyBookingsMessage.reply).not.toHaveBeenCalled();
  });
});
