import type { Module } from '../module.interface';

export class BotModule implements Module {
  launch() {
    console.log('Bot module launched');
  }
}