import { describe, it, expect } from 'vitest';
import { CourtService } from '../../../src/bot/services/court.service';
import { createMockPrisma } from '../../helpers/create-mock-prisma';
import type { PrismaClient, Court } from '../../../src/generated/prisma';

function makeService() {
  const prisma = createMockPrisma();
  const service = new CourtService(prisma as unknown as PrismaClient);
  return { service, prisma };
}

const fakeCourt: Court = { id: 1, name: 'Court A' } as Court;

describe('CourtService', () => {
  describe('all', () => {
    it('queries all courts ordered by id ascending', async () => {
      const { service, prisma } = makeService();
      prisma.court.findMany.mockResolvedValue([]);

      await service.all();

      expect(prisma.court.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
    });

    it('returns the list of courts', async () => {
      const { service, prisma } = makeService();
      const courts = [fakeCourt, { id: 2, name: 'Court B' }] as Court[];
      prisma.court.findMany.mockResolvedValue(courts);

      const result = await service.all();
      expect(result).toBe(courts);
    });
  });

  describe('findById', () => {
    it('queries by id', async () => {
      const { service, prisma } = makeService();
      prisma.court.findUnique.mockResolvedValue(fakeCourt);

      await service.findById(1);

      expect(prisma.court.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('returns the court when found', async () => {
      const { service, prisma } = makeService();
      prisma.court.findUnique.mockResolvedValue(fakeCourt);

      const result = await service.findById(1);
      expect(result).toBe(fakeCourt);
    });

    it('returns null when court does not exist', async () => {
      const { service, prisma } = makeService();
      prisma.court.findUnique.mockResolvedValue(null);

      const result = await service.findById(99);
      expect(result).toBeNull();
    });
  });
});
