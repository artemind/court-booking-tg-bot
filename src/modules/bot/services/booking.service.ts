import { PrismaClient, Booking, Prisma, Court } from '../../../generated/prisma';
import dayjs from 'dayjs';

export class BookingService {
  constructor(private prisma: PrismaClient) {
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
    const endDate = date.endOf('day');

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

  async getBookingsToBeNotified(date: dayjs.Dayjs, minutesBeforeBookingStarts: number, minutesBeforeBookingEnds: number): Promise<(Booking & { user: {telegramId: bigint}, court: Court } )[]> {
    date = date.utc().startOf('minute');

    return this.prisma.booking.findMany({
      where: {
        OR: [
          {
            user: { notifyBeforeBookingStarts: true },
            dateFrom: date.add(minutesBeforeBookingStarts, 'minute').toDate()
          },
          {
            user: { notifyBeforeBookingEnds: true },
            dateTill: date.add(minutesBeforeBookingEnds, 'minute').toDate()
          }
        ]
      },
      include: {
        user: {
          select: {
            telegramId: true
          }
        },
        court: true,
      }
    });
  }
}