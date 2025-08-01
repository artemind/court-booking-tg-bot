import type { Module } from '../module.interface';
import { PrismaClient } from '../../generated/prisma';
import { Telegraf } from 'telegraf';
import { StartHandler } from './handlers/start.handler';
import { Context } from './context';
import { AppendUserMiddleware } from './middlewares/append-user.middleware';
import { UserService } from './services/user.service';

export class BotModule implements Module {

  private bot: Telegraf<Context>;

  private userService: UserService;

  constructor(private prisma: PrismaClient) {
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error('BOT_TOKEN is not defined');
    this.bot = new Telegraf(token);
    this.userService = new UserService(this.prisma);
  }

  async launch(): Promise<void> {
    this.registerMiddlewares();
    this.registerHandlers();
    await this.bot.launch();
  }

  registerMiddlewares(): void {
    this.bot.use(new AppendUserMiddleware(this.userService).apply);
  }

  registerHandlers(): void {
    new StartHandler(this.bot).register();
  }
}