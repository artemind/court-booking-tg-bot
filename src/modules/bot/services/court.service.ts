import { PrismaClient, Court } from '../../../generated/prisma';

export class CourtService {
  constructor(private prisma: PrismaClient) {
  }

  async all(): Promise<Court[]> {
    return this.prisma.court.findMany({ orderBy: { id: 'asc' } });
  }

  async findById(id: number): Promise<Court | null> {
    return this.prisma.court.findUnique({ where: { id } });
  }
}