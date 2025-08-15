import { PrismaClient, User, Prisma } from '../../../generated/prisma';

export class UserService {
  constructor(private prisma: PrismaClient) {
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { telegramId } });
  }

  async update(id: number, name: string, telegramUsername: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        name,
        telegramUsername
      },
    });
  }

  async partialUpdate(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}