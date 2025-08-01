import type { Context as TelegrafContext } from 'telegraf';
import { User } from '../../generated/prisma';
import type { Update } from '@telegraf/types';

export interface Context <U extends Update = Update> extends TelegrafContext<U> {
  user?: User,
}