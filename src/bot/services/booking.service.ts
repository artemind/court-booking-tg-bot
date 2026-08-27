import { Booking, Prisma, Court, PrismaClient } from '../../generated/prisma';
import { SlotConflictException } from '../exceptions/slot-conflict.exception';

import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

export type NotificationKind = 'start' | 'end';

export type NotifiableBooking = Booking & {
  user: { telegramId: bigint, languageCode: string | null },
  court: Court,
};

export interface PendingNotification {
  kind: NotificationKind;
  booking: NotifiableBooking;
}

const NOTIFIED_AT_FIELD: Record<NotificationKind, 'notifiedBeforeStartAt' | 'notifiedBeforeEndAt'> = {
  start: 'notifiedBeforeStartAt',
  end: 'notifiedBeforeEndAt',
};

@injectable()
@provide()
export class BookingService {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {
  }

  async findById(id: number): Promise<Booking | null> {
    return this.prisma.booking.findUnique({ where: { id } });
  }

  async deleteById(id: number): Promise<Booking | null> {
    return this.prisma.booking.delete({ where: { id } });
  }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({
      data,
    });
  }

  async getByDate(courtId: number, date: dayjs.Dayjs): Promise<Booking[]> {
    const startDate = date.startOf('day').utc();
    const endDate = date.endOf('day').utc();

    return this.prisma.booking.findMany({
      where: {
        courtId,
        dateFrom: {
          gte: startDate.toDate(),
          lte: endDate.toDate(),
        }
      }
    });
  }

  async getUpcomingByUserId(userId: number): Promise<(Booking & {court: Court})[]> {
    return this.prisma.booking.findMany({
      where: {
        userId,
        dateTill: {
          gte: dayjs.utc().toDate(),
        }
      },
      include: {
        court: true,
      },
      orderBy: {
        dateFrom: 'asc',
      }
    });
  }

  async createIfAvailable(courtId: number, userId: number, dateFrom: Date, dateTill: Date): Promise<Booking> {
    return this.prisma.$transaction(async (tx) => {
      const conflicts = await tx.booking.count({
        where: {
          courtId,
          AND: [
            { dateFrom: { lt: dateTill } },
            { dateTill: { gt: dateFrom } },
          ],
        },
      });
      if (conflicts > 0) {
        throw new SlotConflictException();
      }
      return tx.booking.create({
        data: {
          user: { connect: { id: userId } },
          court: { connect: { id: courtId } },
          dateFrom,
          dateTill,
        },
      });
    });
  }

  /**
   * Returns notifications that are due but not yet delivered.
   *
   * The window is `(now, now + minutesBefore*]` rather than an exact timestamp match: a booking
   * whose start/end falls anywhere inside the lead time is picked up on the next tick, regardless
   * of whether it aligns with the scheduler's interval or the configured slot size. Already
   * delivered notifications are excluded via the `notified*At` marks, so widening the window
   * cannot produce duplicates and a missed tick is caught up on the following one.
   */
  async getBookingsToBeNotified(date: dayjs.Dayjs, minutesBeforeBookingStarts: number, minutesBeforeBookingEnds: number): Promise<PendingNotification[]> {
    const now = date.utc().startOf('minute');
    const include = {
      user: {
        select: {
          telegramId: true,
          languageCode: true,
        }
      },
      court: true,
    };

    const [starting, ending] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          notifiedBeforeStartAt: null,
          user: { notifyBeforeBookingStarts: true },
          dateFrom: {
            gt: now.toDate(),
            lte: now.add(minutesBeforeBookingStarts, 'minute').toDate(),
          },
        },
        include,
      }),
      this.prisma.booking.findMany({
        where: {
          notifiedBeforeEndAt: null,
          user: { notifyBeforeBookingEnds: true },
          dateTill: {
            gt: now.toDate(),
            lte: now.add(minutesBeforeBookingEnds, 'minute').toDate(),
          },
        },
        include,
      }),
    ]);

    return [
      ...starting.map((booking): PendingNotification => ({ kind: 'start', booking })),
      ...ending.map((booking): PendingNotification => ({ kind: 'end', booking })),
    ];
  }

  /**
   * Atomically marks a notification as delivered. Returns false when another tick or another bot
   * instance already claimed it, in which case the caller must not send anything.
   */
  async claimNotification(bookingId: number, kind: NotificationKind, at: Date): Promise<boolean> {
    const field = NOTIFIED_AT_FIELD[kind];
    const { count } = await this.prisma.booking.updateMany({
      where: { id: bookingId, [field]: null },
      data: { [field]: at },
    });

    return count > 0;
  }

  /**
   * Releases a claim so the notification is retried on a later tick. Used when delivery fails.
   */
  async releaseNotification(bookingId: number, kind: NotificationKind): Promise<void> {
    const field = NOTIFIED_AT_FIELD[kind];
    await this.prisma.booking.updateMany({
      where: { id: bookingId },
      data: { [field]: null },
    });
  }
}