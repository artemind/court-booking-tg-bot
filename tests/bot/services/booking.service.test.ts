import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { BookingService } from '../../../src/bot/services/booking.service';
import { SlotConflictException } from '../../../src/bot/exceptions/slot-conflict.exception';
import { createMockPrisma } from '../../helpers/create-mock-prisma';
import type { PrismaClient } from '../../../src/generated/prisma';

function makeService() {
  const prisma = createMockPrisma();
  const service = new BookingService(prisma as unknown as PrismaClient);
  return { service, prisma };
}

// ─────────────────────────────────────────────
// findById
// ─────────────────────────────────────────────
describe('findById', () => {
  it('calls findUnique with the given id', async () => {
    const { service, prisma } = makeService();
    const fakeBooking = { id: 5 } as any;
    prisma.booking.findUnique.mockResolvedValue(fakeBooking);

    const result = await service.findById(5);

    expect(prisma.booking.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(result).toBe(fakeBooking);
  });

  it('returns null when booking not found', async () => {
    const { service, prisma } = makeService();
    prisma.booking.findUnique.mockResolvedValue(null);

    const result = await service.findById(999);

    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────
// deleteById
// ─────────────────────────────────────────────
describe('deleteById', () => {
  it('calls delete with the given id and returns the deleted booking', async () => {
    const { service, prisma } = makeService();
    const deleted = { id: 3 } as any;
    prisma.booking.delete.mockResolvedValue(deleted);

    const result = await service.deleteById(3);

    expect(prisma.booking.delete).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(result).toBe(deleted);
  });
});

// ─────────────────────────────────────────────
// create
// ─────────────────────────────────────────────
describe('create', () => {
  it('calls prisma.booking.create with the provided data', async () => {
    const { service, prisma } = makeService();
    const input = { courtId: 1, userId: 2, dateFrom: new Date(), dateTill: new Date() } as any;
    const created = { id: 10, ...input } as any;
    prisma.booking.create.mockResolvedValue(created);

    const result = await service.create(input);

    expect(prisma.booking.create).toHaveBeenCalledWith({ data: input });
    expect(result).toBe(created);
  });
});

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
    expect(lte).toEqual(date.endOf('day').utc().toDate());
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
// createIfAvailable
// ─────────────────────────────────────────────
describe('createIfAvailable', () => {
  const dateFrom = new Date('2024-06-01T10:00:00Z');
  const dateTill = new Date('2024-06-01T11:00:00Z');

  function withTransaction(prisma: ReturnType<typeof createMockPrisma>) {
    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
  }

  it('creates booking when no overlapping bookings exist', async () => {
    const { service, prisma } = makeService();
    withTransaction(prisma);
    prisma.booking.count.mockResolvedValue(0);
    const created = { id: 10 } as any;
    prisma.booking.create.mockResolvedValue(created);

    const result = await service.createIfAvailable(1, 2, dateFrom, dateTill);

    expect(result).toBe(created);
    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: 2 } },
        court: { connect: { id: 1 } },
        dateFrom,
        dateTill,
      },
    });
  });

  it('throws SlotConflictException when an overlapping booking exists', async () => {
    const { service, prisma } = makeService();
    withTransaction(prisma);
    prisma.booking.count.mockResolvedValue(1);

    await expect(service.createIfAvailable(1, 2, dateFrom, dateTill))
      .rejects.toThrow(SlotConflictException);
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it('queries overlaps with correct courtId and date range', async () => {
    const { service, prisma } = makeService();
    withTransaction(prisma);
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.create.mockResolvedValue({ id: 1 } as any);

    await service.createIfAvailable(5, 3, dateFrom, dateTill);

    expect(prisma.booking.count).toHaveBeenCalledWith({
      where: {
        courtId: 5,
        AND: [
          { dateFrom: { lt: dateTill } },
          { dateTill: { gt: dateFrom } },
        ],
      },
    });
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
