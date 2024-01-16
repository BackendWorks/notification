import { Injectable, Logger } from '@nestjs/common';
import { InjectNovu } from '../providers/novu.provider';
import { InjectModel } from '@nestjs/mongoose';
import { Novu } from '@novu/node';
import {
  Notification,
  NotificationDocument,
} from '../schema/notification.schema';
import { Model } from 'mongoose';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { UpdateSubscriberDto } from '../dtos/update.sub.dto';
import { CreateNotificationDto } from '../dtos/create.notification.dto';
import { CreateSubscriberDto } from '../dtos/create.sub.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import { INotificationService } from '../interfaces/notification.service.interface';
import { NotificationSendResponse } from '../interfaces/notification.interface';
import { Recipients, RecipientsDocument } from '../schema/recipients.schema';

@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectNovu() private readonly novu: Novu,
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(Recipients.name)
    private recipientsModel: Model<RecipientsDocument>,
  ) {}

  async createNotification(userId: string, data: CreateNotificationDto) {
    try {
      const { body, title, type, recipientIds } = data;

      const notification = await this.notificationModel.create({
        title,
        body,
        type,
        senderId: userId,
      });

      const recipients = await Promise.all(
        recipientIds.map((userId) => this.recipientsModel.create({ userId })),
      );

      notification.recipients = recipients.map((recipient) => recipient._id);

      await notification.save();

      return notification;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async updateNotification(data: UpdateNotificationDto) {
    const { body, title, notificationId } = data;

    return this.notificationModel.findOneAndUpdate(
      {
        id: notificationId,
      },
      {
        $set: {
          title,
          body,
        },
      },
      {
        new: false,
      },
    );
  }

  async deleteNotification(notificationId: string) {
    try {
      await this.notificationModel.deleteOne({
        id: notificationId,
      });
      return {
        status: true,
        message: 'Notification deleted.',
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async createSubscriber(userId: string, data: CreateSubscriberDto) {
    try {
      const { email, firstName, lastName, phone } = data;
      return this.novu.subscribers.identify(userId, {
        email,
        firstName,
        lastName,
        phone,
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async updateSubscriber(subId: string, data: UpdateSubscriberDto) {
    try {
      const { email, firstName, lastName, phone } = data;
      await this.novu.subscribers.update(subId, {
        email,
        firstName,
        lastName,
        phone,
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async deleteSubscriber(subId: string) {
    try {
      await this.novu.subscribers.delete(subId);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getNotification(notificationId: string) {
    return this.notificationModel.findById<Notification>(notificationId).exec();
  }

  async getNotifications(userId: string, data: GetNotificationDto) {
    try {
      const { skip, take, searchTerm } = data;
      const count = await this.notificationModel.count().exec();
      const response = await this.notificationModel
        .find({
          ...(userId && {
            senderId: userId,
          }),
          ...(searchTerm && {
            $or: [
              {
                title: searchTerm,
              },
              {
                body: searchTerm,
              },
            ],
          }),
        })
        .skip(skip)
        .limit(take)
        .exec();
      return {
        count,
        data: response,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async sendEmail(data: SendEmailDto) {
    try {
      const { subId, type } = data;
      const { data: result } = await this.novu.trigger(type, {
        to: {
          subscriberId: subId,
        },
        payload: {},
      });
      const response = result?.data as NotificationSendResponse;
      return response;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async sendText(data: SendTextDto) {
    try {
      const { subId, type } = data;
      const sub = await this.novu.subscribers.get(subId);
      const { data: user } = sub.data;
      const { data: result } = await this.novu.trigger(type, {
        to: {
          subscriberId: subId,
        },
        payload: {
          firstName: user?.firstName,
        },
      });
      const response = result?.data as NotificationSendResponse;
      return response;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
