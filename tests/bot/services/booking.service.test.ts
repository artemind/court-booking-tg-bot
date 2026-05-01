import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { BookingService } from '../../../src/bot/services/booking.service';
import { createMockPrisma } from '../../helpers/create-mock-prisma';
import type { PrismaClient } from '../../../src/generated/prisma';

function makeService() {
  const prisma = createMockPrisma();
  const service = new BookingService(prisma as unknown as PrismaClient);
  return { service, prisma };
}

// ─────────────────────────────────────────────
// getByDate
// ─────────────────────────────────────────────
describe('getByDate', () => {
  it('queries with courtId in WHERE clause', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    await service.getByDate(42, dayjs.utc('2024-06-01'));

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ courtId: 42 }),
      }),
    );
  });

  it('uses startOf("day") UTC as gte and endOf("day") as lte', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    const date = dayjs.utc('2024-06-01');
    await service.getByDate(1, date);

    const call = prisma.booking.findMany.mock.calls[0]![0] as any;
    const { gte, lte } = call.where.dateFrom;

    expect(gte).toEqual(date.startOf('day').utc().toDate());
    expect(lte).toEqual(date.endOf('day').toDate());
  });

  it('returns whatever Prisma returns', async () => {
    const { service, prisma } = makeService();
    const fakeBookings = [{ id: 1 }, { id: 2 }] as any;
    prisma.booking.findMany.mockResolvedValue(fakeBookings);

    const result = await service.getByDate(1, dayjs.utc('2024-06-01'));
    expect(result).toBe(fakeBookings);
  });
});

// ─────────────────────────────────────────────
// getUpcomingByUserId
// ─────────────────────────────────────────────
describe('getUpcomingByUserId', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-01T10:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('filters by userId', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    await service.getUpcomingByUserId(7);

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 7 }),
      }),
    );
  });

  it('filters dateTill >= now in UTC', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    await service.getUpcomingByUserId(7);

    const call = prisma.booking.findMany.mock.calls[0]![0] as any;
    expect(call.where.dateTill.gte).toEqual(new Date('2024-06-01T10:00:00.000Z'));
  });

  it('includes court relation', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    await service.getUpcomingByUserId(7);

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { court: true } }),
    );
  });

  it('orders by dateFrom ascending', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    await service.getUpcomingByUserId(7);

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { dateFrom: 'asc' } }),
    );
  });
});

// ─────────────────────────────────────────────
// getBookingsToBeNotified
// ─────────────────────────────────────────────
describe('getBookingsToBeNotified', () => {
  it('truncates date to startOf("minute") before computing targets', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    // 10:05:45 → startOf('minute') = 10:05:00
    const date = dayjs.utc('2024-06-01T10:05:45Z');
    await service.getBookingsToBeNotified(date, 30, 15);

    const call = prisma.booking.findMany.mock.calls[0]![0] as any;
    const orClause = call.where.OR;
    expect(orClause[0].dateFrom).toEqual(new Date('2024-06-01T10:35:00.000Z')); // 10:05 + 30
    expect(orClause[1].dateTill).toEqual(new Date('2024-06-01T10:20:00.000Z')); // 10:05 + 15
  });

  it('includes both OR conditions in a single query', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    const date = dayjs.utc('2024-06-01T10:00:00Z');
    await service.getBookingsToBeNotified(date, 30, 15);

    const call = prisma.booking.findMany.mock.calls[0]![0] as any;
    expect(call.where.OR).toHaveLength(2);
    expect(call.where.OR[0]).toMatchObject({
      user: { notifyBeforeBookingStarts: true },
      dateFrom: new Date('2024-06-01T10:30:00.000Z'),
    });
    expect(call.where.OR[1]).toMatchObject({
      user: { notifyBeforeBookingEnds: true },
      dateTill: new Date('2024-06-01T10:15:00.000Z'),
    });
  });

  it('returns empty array when nothing matches', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    const result = await service.getBookingsToBeNotified(dayjs.utc(), 30, 15);
    expect(result).toEqual([]);
  });

  it('includes user (telegramId, languageCode) and court in the result', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findMany.mockResolvedValue([]);

    await service.getBookingsToBeNotified(dayjs.utc('2024-06-01T10:00:00Z'), 30, 15);

    const call = prisma.booking.findMany.mock.calls[0]![0] as any;
    expect(call.include).toMatchObject({
      user: { select: { telegramId: true, languageCode: true } },
      court: true,
    });
  });
});
