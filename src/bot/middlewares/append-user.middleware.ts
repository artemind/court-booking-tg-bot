import { UserService } from '../services/user.service';
import { Context } from '../context';
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
      const telegramUsername = ctx.from?.username;
      const telegramId = ctx.from?.id;
      if (!telegramId || !telegramUsername) {
        return;
      }

      let user = await this.userService.findByTelegramId(telegramId);
      if (!user) {
        user = await this.userService.create({
          name,
          telegramId,
          telegramUsername
        });
      } else if (user.telegramUsername !== telegramUsername || user.name !== name) {
        user = await this.userService.update(user.id, name, telegramUsername);
      }
      ctx.user = user;

      return next();
    };
  }
}