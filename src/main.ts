import type { Module } from './modules/module.interface';
import { BotModule } from './modules/bot/bot.module';

function bootstrap(): void {
  const modules: Module[] = [
    new BotModule()
  ];

  modules.forEach(module => module.launch());
}

bootstrap();