import { UserService } from '../services/user.service';
import { Context } from '../context';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class AppendUserMiddleware {
  constructor(@inject(UserService) private userService: UserService) {
  }

  middleware(): (ctx: Context, next: () => Promise<void>) => Promise<void> {
    return async (ctx: Context, next: () => Promise<void>): Promise<void> => {
      const name = `${ctx.from?.first_name ?? ''} ${ctx.from?.last_name ?? ''}`.trim();
      const telegramUsername = ctx.from?.username ?? null;
      const languageCode = ctx.from?.language_code || null;
      const telegramId = ctx.from?.id;
      if (!telegramId) {
        throw new UserNotFoundException();
      }

      ctx.user = await this.userService.upsert({ name, telegramId, telegramUsername, languageCode });

      return next();
    };
  }
}