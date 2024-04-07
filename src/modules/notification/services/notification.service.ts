import { Injectable, Logger } from '@nestjs/common';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { CreateNotificationDto } from '../dtos/create.notification.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import { INotificationService } from '../interfaces/notification.service.interface';
import { PrismaService } from 'src/common/services/prisma.service';
import { Notification } from '@prisma/client';
import {
  INotificationGetManyResponse,
  INotificationSendResponse,
  INotificationSuccessResponse,
} from '../interfaces/notification.interface';
import { SendInAppDto } from '../dtos/send.inapp.dto';

@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(
    senderId: string,
    data: CreateNotificationDto,
  ): Promise<Notification> {
    try {
      const { body, title, type, recipientIds, subject } = data;

      const notification = await this.prismaService.notification.create({
        data: {
          title,
          body,
          type,
          senderId,
          actionPayload: {},
          subject,
        },
      });

      await Promise.all(
        recipientIds.map((id) => {
          return this.prismaService.recipients.create({
            data: {
              userId: id,
              seenByUser: false,
              notification: {
                connect: {
                  id: notification.id,
                },
              },
            },
          });
        }),
      );

      return notification;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async updateNotification(
    notificationId: string,
    data: UpdateNotificationDto,
  ): Promise<Notification> {
    const { body, title } = data;

    return this.prismaService.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        title,
        body,
      },
    });
  }

  async deleteNotification(
    notificationId: string,
  ): Promise<INotificationSuccessResponse> {
    try {
      await this.prismaService.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          deletedAt: new Date(),
          isDeleted: true,
        },
      });
      return {
        message: 'Notification deleted',
        status: true,
      };
    } catch (e) {
      throw e;
    }
  }

  async getNotification(notificationId: string): Promise<Notification> {
    return this.prismaService.notification.findUnique({
      where: {
        id: notificationId,
      },
    });
  }

  async getNotifications(
    userId: string,
    query: GetNotificationDto,
  ): Promise<INotificationGetManyResponse<Notification>> {
    try {
      const { skip, take, searchTerm } = query;
      const count = await this.prismaService.notification.count({
        where: {
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
        },
      });
      const data = await this.prismaService.notification.findMany({
        where: {
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
        },
        skip,
        take,
      });
      return {
        count,
        data,
      };
    } catch (e) {
      throw e;
    }
  }

  async sendEmail(data: SendEmailDto): Promise<INotificationSendResponse> {
    return Promise.resolve({
      acknowledged: true,
      status: 'OK',
      transactionId: 'test',
    });
  }

  async sendText(data: SendTextDto): Promise<INotificationSendResponse> {
    return Promise.resolve({
      acknowledged: true,
      status: 'OK',
      transactionId: 'test',
    });
  }

  async sendInApp(data: SendInAppDto): Promise<INotificationSendResponse> {
    return Promise.resolve({
      acknowledged: true,
      status: 'OK',
      transactionId: 'test',
    });
  }
}
