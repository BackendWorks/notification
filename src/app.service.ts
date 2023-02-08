import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { GetResponse, INotificationPayload } from './types';
import { Notification, NotificationDocument } from './app.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GetNotificationDto } from './dtos/get-notification.dto';

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

  public async createNotification(data: INotificationPayload): Promise<void> {
    try {
      const { content, type, payload, userId } = data;
      const notification = new this.notificationModel({
        user_id: userId,
        content,
        type,
        payload: JSON.stringify(payload),
      });
      await notification.save();
      const user = await firstValueFrom(
        this.authClient.send('get_user_by_userid', JSON.stringify({ userId })),
      );
      console.log('device id', user?.deviceId);
      if (user?.deviceId) {
        this.taskQueue.add({ token: user.deviceId, ...data }, { backoff: 3 });
      }
    } catch (e) {
      throw e;
    }
  }

  public async getNotifications(
    data: GetNotificationDto,
    userId: number,
  ): Promise<GetResponse<Notification>> {
    try {
      let { limit, page } = data;
      if (!page || page === 0) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const skip = (page - 1) * limit;
      const count = await this.notificationModel.count().exec();
      const response = await this.notificationModel
        .find({
          user_id: userId,
        })
        .skip(skip)
        .limit(limit)
        .exec();
      return {
        count,
        data: response,
      };
    } catch (e) {
      throw e;
    }
  }
}
