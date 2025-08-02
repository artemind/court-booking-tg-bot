import type { Module } from '../module.interface';
import { PrismaClient } from '../../generated/prisma';
import { session, Telegraf } from 'telegraf';
import { StartHandler } from './handlers/start.handler';
import { Context } from './context';
import { AppendUserMiddleware } from './middlewares/append-user.middleware';
import { UserService } from './services/user.service';
import { ReplyableException } from './exceptions/replyable.exception';
import { RestrictAccessMiddleware } from './middlewares/restrict-access.middleware';
import { StartBookingHandler } from './handlers/booking/start-booking.handler';
import { CourtService } from './services/court.service';
import { ChooseCourtHandler } from './handlers/booking/choose-court.handler';
import { StartSessionMiddleware } from './middlewares/start-session.middleware';

export class BotModule implements Module {

  private bot: Telegraf<Context>;

  private userService: UserService;

  private courtService: CourtService;

  constructor(private prisma: PrismaClient) {
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error('BOT_TOKEN is not defined');
    this.bot = new Telegraf(token);
    this.userService = new UserService(this.prisma);
    this.courtService = new CourtService(this.prisma);
  }

  async launch(): Promise<void> {
    this.registerErrorHandler();
    this.registerMiddlewares();
    this.registerHandlers();
    await this.bot.launch();
  }

  registerErrorHandler(): void {
    this.bot.catch((err, ctx) => {
      console.error(err);
      if (err instanceof ReplyableException) {
        ctx.reply('Ooops, something went wrong: ' + err.message);
      } else {
        ctx.reply('Ooops, something went wrong.');
      }
    });
  }

  registerMiddlewares(): void {
    this.bot.use(session());
    this.bot.use(new StartSessionMiddleware().apply);
    this.bot.use(new AppendUserMiddleware(this.userService).apply);
    this.bot.use(new RestrictAccessMiddleware().apply);
  }

  registerHandlers(): void {
    new StartHandler(this.bot).register();
    new StartBookingHandler(this.bot, this.courtService).register();
    new ChooseCourtHandler(this.bot, this.courtService).register();
  }
}