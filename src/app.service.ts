import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { GetResponse, INotificationPayload } from './types';
import { Notification, NotificationDocument } from './app.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GetNotificationDto } from './dtos/get-notification.dto';
import { FirebaseService } from './services';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private firebaseService: FirebaseService,
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
        this.authClient.send('get_user_by_id', JSON.stringify({ id: userId })),
      );
      console.log('device id', user?.deviceId);
      if (user?.deviceId) {
        this.firebaseService
          .sendMessage(user?.deviceId, content, payload)
          .then(() => {
            this.logger.log('notificaiton sent.');
          })
          .catch((e) => {
            this.logger.error('notification failed.', e);
          });
      } else {
        this.logger.log('device id is not exists!');
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
