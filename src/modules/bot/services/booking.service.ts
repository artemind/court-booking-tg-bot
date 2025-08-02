import { PrismaClient, Booking, Prisma } from '../../../generated/prisma';
import dayjs from 'dayjs';

export class BookingService {
  constructor(private prisma: PrismaClient) {
  }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return this.prisma.booking.create({
      data,
    });
  }

  async getByDate(courtId: number, date: dayjs.Dayjs): Promise<Booking[]> {
    const startDate = date.startOf('day');
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
}