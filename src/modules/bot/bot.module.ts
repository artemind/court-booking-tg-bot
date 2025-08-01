import type { Module } from '../module.interface';
import { PrismaClient } from '../../generated/prisma';
import { Context, Telegraf } from 'telegraf';
import { StartHandler } from './handlers/start.handler';

export class BotModule implements Module {

  private bot: Telegraf<Context>;

  constructor(private prisma: PrismaClient) {
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error('BOT_TOKEN is not defined');
    this.bot = new Telegraf(token);
  }

  async launch(): Promise<void> {
    this.registerHandlers();
    await this.bot.launch();
  }

  registerHandlers(): void {
    new StartHandler(this.bot).register();
  }
}