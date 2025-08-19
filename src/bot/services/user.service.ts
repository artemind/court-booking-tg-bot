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
}