import type { Module } from '../module.interface';

export class BotModule implements Module {
  async launch(): Promise<void> {
    console.log('Bot module launched');
  }
}