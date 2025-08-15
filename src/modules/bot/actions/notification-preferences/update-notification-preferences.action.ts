import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { UserService } from '../../services/user.service';
import {
  NotificationPreferencesUpdatedMessage
} from '../../messages/notification-preferences/notification-preferences-updated.message';

export class UpdateNotificationPreferencesAction {
  constructor(private userService: UserService) {}

  async enableNotificationBeforeBookingStarts(ctx: Context): Promise<Message.TextMessage> {
    const user = await this.userService.partialUpdate(ctx.user!.id, {
      notifyBeforeBookingStarts: true,
    });

    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }

  async disableNotificationBeforeBookingStarts(ctx: Context): Promise<Message.TextMessage> {
    const user = await this.userService.partialUpdate(ctx.user!.id, {
      notifyBeforeBookingStarts: false,
    });

    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }

  async enableNotificationBeforeBookingEnds(ctx: Context): Promise<Message.TextMessage> {
    const user = await this.userService.partialUpdate(ctx.user!.id, {
      notifyBeforeBookingEnds: true,
    });

    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }

  async disableNotificationBeforeBookingEnds(ctx: Context): Promise<Message.TextMessage> {
    const user = await this.userService.partialUpdate(ctx.user!.id, {
      notifyBeforeBookingEnds: false,
    });

    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }
}