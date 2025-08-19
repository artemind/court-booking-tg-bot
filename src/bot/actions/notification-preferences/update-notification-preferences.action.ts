import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { UserService } from '../../services/user.service';
import {
  NotificationPreferencesUpdatedMessage
} from '../../messages/notification-preferences/notification-preferences-updated.message';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class UpdateNotificationPreferencesAction {
  constructor(
    @inject(UserService)
    private userService: UserService
  ) {}

  async enableNotificationBeforeBookingStarts(ctx: Context): Promise<Message.TextMessage> {
    const user = await this.userService.update(ctx.user!.id, {
      notifyBeforeBookingStarts: true,
    });

    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }

  async disableNotificationBeforeBookingStarts(ctx: Context): Promise<Message.TextMessage> {
    const user = await this.userService.update(ctx.user!.id, {
      notifyBeforeBookingStarts: false,
    });

    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }

  async enableNotificationBeforeBookingEnds(ctx: Context): Promise<Message.TextMessage> {
    const user = await this.userService.update(ctx.user!.id, {
      notifyBeforeBookingEnds: true,
    });

    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }

  async disableNotificationBeforeBookingEnds(ctx: Context): Promise<Message.TextMessage> {
    const user = await this.userService.update(ctx.user!.id, {
      notifyBeforeBookingEnds: false,
    });

    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }
}