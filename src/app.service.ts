import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { INotificationPayload } from './types';
import { Notification, NotificationDocument } from './app.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AppService {
  constructor(
    @InjectQueue('notification-sender') private taskQueue: Queue,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {
    this.authClient.connect();
  }

  public async createNotifications(data: INotificationPayload): Promise<void> {
    const { content, type, payload, userId } = data;
    const notification = new this.notificationModel({
      user_id: userId,
      content,
      type,
      payload,
    });
    await notification.save();
    const deviceId = await firstValueFrom(
      this.authClient.send('get_device_id', { userId }),
    );
    this.taskQueue.add({ token: deviceId, ...data }, { backoff: 3 });
  }
}
