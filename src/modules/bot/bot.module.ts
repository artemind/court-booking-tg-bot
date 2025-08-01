import type { Module } from '../module.interface';
import { PrismaClient } from '../../generated/prisma';

export class BotModule implements Module {
  constructor(private prisma: PrismaClient) {
  }

  async launch(): Promise<void> {
    console.log('Bot module launched');
  }
}