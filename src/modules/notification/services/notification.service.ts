/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { NotificationCreateDto } from '../dtos/create.notification.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import { INotificationService } from '../interfaces/notification.service.interface';
import { PrismaService } from '../../../common/services/prisma.service';
import { INotificationSendResponse } from '../interfaces/notification.interface';
import { SendInAppDto } from '../dtos/send.inapp.dto';
import {
  NotificationPaginationResponseDto,
  NotificationResponseDto,
} from '../dtos/notification.response.dto';
import { GenericResponseDto } from '../dtos/generic.response.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    this.authClient.connect();
  }

  async createNotification(
    senderId: number,
    data: NotificationCreateDto,
  ): Promise<NotificationResponseDto> {
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

    const recipients = [];
    for (const userId of recipientIds) {
      const recipient = await this.prismaService.recipients.create({
        data: {
          userId,
          seenByUser: false,
          notification: { connect: { id: notification.id } },
        },
      });

      const user = await firstValueFrom(
        this.authClient.send(
          'getUserById',
          JSON.stringify({ userId: recipient.userId }),
        ),
      );

      recipients.push({ ...recipient, user });
    }

    const sender = await firstValueFrom(
      this.authClient.send('getUserById', JSON.stringify({ userId: senderId })),
    );

    return {
      ...notification,
      sender,
      recipients,
    };
  }

  async updateNotification(
    notificationId: string,
    data: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const { body, title } = data;

    const check = await this.prismaService.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (!check) {
      throw new NotFoundException('notificationNotfound');
    }

    const notification = await this.prismaService.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        title,
        body,
      },
    });

    const recipientsPopulated = [];

    const recipients = await this.prismaService.recipients.findMany({
      where: {
        notificationId,
      },
    });

    for (const recipient of recipients) {
      const user = await firstValueFrom(
        this.authClient.send(
          'getUserById',
          JSON.stringify({ userId: recipient.userId }),
        ),
      );

      recipientsPopulated.push({ ...recipient, user });
    }

    const sender = await firstValueFrom(
      this.authClient.send(
        'getUserById',
        JSON.stringify({ userId: notification.senderId }),
      ),
    );

    return {
      ...notification,
      sender,
      recipients: recipientsPopulated,
    };
  }

  async deleteNotification(
    notificationId: string,
  ): Promise<GenericResponseDto> {
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
        status: true,
        message: 'notificationDeleted',
      };
    } catch (e) {
      throw e;
    }
  }

  async getNotification(
    notificationId: string,
  ): Promise<NotificationResponseDto> {
    try {
      const notification = await this.prismaService.notification.findUnique({
        where: {
          id: notificationId,
        },
      });

      const recipientsPopulated = [];

      const recipients = await this.prismaService.recipients.findMany({
        where: {
          notificationId,
        },
      });

      for (const recipient of recipients) {
        const user = await firstValueFrom(
          this.authClient.send(
            'getUserById',
            JSON.stringify({ userId: recipient.userId }),
          ),
        );

        recipientsPopulated.push({ ...recipient, user });
      }

      const sender = await firstValueFrom(
        this.authClient.send(
          'getUserById',
          JSON.stringify({ userId: notification.senderId }),
        ),
      );

      return {
        ...notification,
        sender,
        recipients: recipientsPopulated,
      };
    } catch (e) {
      throw e;
    }
  }

  async getNotifications(
    userId: number,
    query: GetNotificationDto,
  ): Promise<NotificationPaginationResponseDto> {
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
      const notifications = await this.prismaService.notification.findMany({
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
      const populatedNotifications = [];
      for (const notification of notifications) {
        const sender = await firstValueFrom(
          this.authClient.send(
            'getUserById',
            JSON.stringify({ userId: notification.senderId }),
          ),
        );

        const recipients = await this.prismaService.recipients.findMany({
          where: { notificationId: notification.id },
        });

        const populatedRecipients = [];
        for (const recipient of recipients) {
          const user = await firstValueFrom(
            this.authClient.send(
              'getUserById',
              JSON.stringify({ userId: recipient.userId }),
            ),
          );
          populatedRecipients.push({ ...recipient, user });
        }

        populatedNotifications.push({
          ...notification,
          sender,
          recipients: populatedRecipients,
        });
      }
      return {
        count,
        data: populatedNotifications,
      };
    } catch (e) {
      throw e;
    }
  }

  async sendEmail(_data: SendEmailDto): Promise<INotificationSendResponse> {
    return Promise.resolve({
      acknowledged: true,
      status: 'OK',
      transactionId: 'test',
    });
  }

  async sendText(_data: SendTextDto): Promise<INotificationSendResponse> {
    return Promise.resolve({
      acknowledged: true,
      status: 'OK',
      transactionId: 'test',
    });
  }

  async sendInApp(_data: SendInAppDto): Promise<INotificationSendResponse> {
    return Promise.resolve({
      acknowledged: true,
      status: 'OK',
      transactionId: 'test',
    });
  }
}
