import { describe, it, expect } from 'vitest';
import { UserService } from '../../../src/bot/services/user.service';
import { createMockPrisma } from '../../helpers/create-mock-prisma';
import type { PrismaClient, User } from '../../../src/generated/prisma';

function makeService() {
  const prisma = createMockPrisma();
  const service = new UserService(prisma as unknown as PrismaClient);
  return { service, prisma };
}

const fakeUser: User = {
  id: 1,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Test User',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: true,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

describe('UserService', () => {
  describe('create', () => {
    it('calls prisma.user.create with the provided data', async () => {
      const { service, prisma } = makeService();
      prisma.user.create.mockResolvedValue(fakeUser);

      const data = {
        name: 'Test User',
        telegramId: 123456,
        telegramUsername: 'testuser',
        languageCode: 'en',
      };
      await service.create(data as any);

      expect(prisma.user.create).toHaveBeenCalledWith({ data });
    });

    it('returns the created user', async () => {
      const { service, prisma } = makeService();
      prisma.user.create.mockResolvedValue(fakeUser);

      const result = await service.create({} as any);
      expect(result).toBe(fakeUser);
    });
  });

  describe('findByTelegramId', () => {
    it('queries by telegramId', async () => {
      const { service, prisma } = makeService();
      prisma.user.findUnique.mockResolvedValue(fakeUser);

      await service.findByTelegramId(123456);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { telegramId: 123456 },
      });
    });

    it('returns the user when found', async () => {
      const { service, prisma } = makeService();
      prisma.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.findByTelegramId(123456);
      expect(result).toBe(fakeUser);
    });

    it('returns null when user does not exist', async () => {
      const { service, prisma } = makeService();
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByTelegramId(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('calls prisma.user.update with id and the provided fields', async () => {
      const { service, prisma } = makeService();
      prisma.user.update.mockResolvedValue(fakeUser);

      await service.update(1, { name: 'New Name' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'New Name' },
      });
    });

    it('passes only the specified fields (partial update)', async () => {
      const { service, prisma } = makeService();
      prisma.user.update.mockResolvedValue(fakeUser);

      await service.update(1, { languageCode: 'uk' });

      const call = prisma.user.update.mock.calls[0]![0] as any;
      expect(call.data).toEqual({ languageCode: 'uk' });
      expect(call.data).not.toHaveProperty('name');
    });

    it('returns the updated user', async () => {
      const { service, prisma } = makeService();
      const updated = { ...fakeUser, name: 'New Name' } as User;
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'New Name' });
      expect(result).toBe(updated);
    });
  });

  describe('upsert', () => {
    const upsertData = {
      telegramId: 123456,
      name: 'Test User',
      telegramUsername: 'testuser',
      languageCode: 'en',
    };

    it('creates a new user when none exists', async () => {
      const { service, prisma } = makeService();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(fakeUser);

      await service.upsert(upsertData);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('returns the created user', async () => {
      const { service, prisma } = makeService();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(fakeUser);

      const result = await service.upsert(upsertData);
      expect(result).toBe(fakeUser);
    });

    it('returns existing user without calling update when no fields changed', async () => {
      const { service, prisma } = makeService();
      prisma.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.upsert(upsertData);

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(result).toBe(fakeUser);
    });

    it('updates when name changed', async () => {
      const { service, prisma } = makeService();
      const existing = { ...fakeUser, name: 'Old Name' } as User;
      prisma.user.findUnique.mockResolvedValue(existing);
      prisma.user.update.mockResolvedValue(fakeUser);

      await service.upsert(upsertData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: existing.id },
        data: { name: 'Test User', telegramUsername: 'testuser', languageCode: 'en' },
      });
    });

    it('updates when telegramUsername changed', async () => {
      const { service, prisma } = makeService();
      const existing = { ...fakeUser, telegramUsername: 'oldusername' } as User;
      prisma.user.findUnique.mockResolvedValue(existing);
      prisma.user.update.mockResolvedValue(fakeUser);

      await service.upsert(upsertData);

      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('updates when languageCode changed', async () => {
      const { service, prisma } = makeService();
      const existing = { ...fakeUser, languageCode: 'uk' } as User;
      prisma.user.findUnique.mockResolvedValue(existing);
      prisma.user.update.mockResolvedValue(fakeUser);

      await service.upsert(upsertData);

      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
