import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { INotificationPayload } from './types';
import { PrismaService } from './core/services';
@Injectable()
export class AppService {
  constructor(
    @InjectQueue('notification-sender') private taskQueue: Queue,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private prismaService: PrismaService,
  ) {
    this.authClient.connect();
  }

  public async manageNotifications(data: INotificationPayload): Promise<void> {
    const { content, type, payload, userId } = data;
    await this.prismaService.notification.create({
      data: {
        user_id: userId,
        content,
        type,
        payload,
      },
    });
    const deviceId = await firstValueFrom(
      this.authClient.send('get_device_id', { userId }),
    );
    this.taskQueue.add({ token: deviceId, ...data }, { backoff: 3 });
  }
}
