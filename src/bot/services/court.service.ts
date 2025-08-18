import { PrismaClient, Court } from '../../generated/prisma';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class CourtService {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {
  }

  async all(): Promise<Court[]> {
    return this.prisma.court.findMany({ orderBy: { id: 'asc' } });
  }

  async findById(id: number): Promise<Court | null> {
    return this.prisma.court.findUnique({ where: { id } });
  }
}