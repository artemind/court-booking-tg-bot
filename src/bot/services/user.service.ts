import { PrismaClient, User, Prisma } from '../../generated/prisma';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class UserService {
  constructor(@inject(PrismaClient) private prisma: PrismaClient) {
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { telegramId } });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async upsert(data: {
    telegramId: number;
    name: string;
    telegramUsername: string | null;
    languageCode: string | null;
  }): Promise<User> {
    const existing = await this.findByTelegramId(data.telegramId);
    if (!existing) {
      return this.create(data);
    }
    const isDirty =
      existing.telegramUsername !== data.telegramUsername ||
      existing.name !== data.name ||
      existing.languageCode !== data.languageCode;
    if (isDirty) {
      return this.update(existing.id, {
        name: data.name,
        telegramUsername: data.telegramUsername,
        languageCode: data.languageCode,
      });
    }
    return existing;
  }
}