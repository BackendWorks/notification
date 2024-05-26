import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../common/services/prisma.service';
import { NotificationService } from './notification.service';
import { Notification } from '@prisma/client';
import { CreateNotificationDto } from '../dtos/create.notification.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { SendInAppDto } from '../dtos/send.inapp.dto';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            recipients: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification and add recipients', async () => {
      const senderId = 1;
      const data = {
        body: 'Test Body',
        title: 'Test Title',
        type: 'Email',
        recipientIds: [2, 3],
        subject: 'Welcome',
      } as CreateNotificationDto;

      const notification = { id: 'notification-id' } as Notification;
      prismaService.notification.create = jest
        .fn()
        .mockResolvedValue(notification);
      prismaService.recipients.create = jest.fn();

      const result = await service.createNotification(senderId, data);

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          body: data.body,
          title: data.title,
          type: data.type,
          senderId,
          actionPayload: {},
          subject: data.subject,
        },
      });
      expect(prismaService.recipients.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual(notification);
    });
  });

  describe('updateNotification', () => {
    it('should update a notification', async () => {
      const notificationId = 'notification-id';
      const data: UpdateNotificationDto = {
        body: 'Updated Body',
        title: 'Updated Title',
      };

      const updatedNotification = { id: notificationId } as Notification;
      prismaService.notification.update = jest
        .fn()
        .mockResolvedValue(updatedNotification);

      const result = await service.updateNotification(notificationId, data);

      expect(prismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: {
          body: data.body,
          title: data.title,
        },
      });
      expect(result).toEqual(updatedNotification);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notificationId = 'notification-id';

      prismaService.notification.update = jest.fn().mockResolvedValue(null);

      const result = await service.deleteNotification(notificationId);

      expect(prismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: {
          deletedAt: expect.any(Date),
          isDeleted: true,
        },
      });
      expect(result).toEqual({
        message: 'Notification deleted',
        status: true,
      });
    });
  });

  describe('getNotification', () => {
    it('should return a notification by id', async () => {
      const notificationId = 'notification-id';
      const notification = { id: notificationId } as Notification;

      prismaService.notification.findUnique = jest
        .fn()
        .mockResolvedValue(notification);

      const result = await service.getNotification(notificationId);

      expect(prismaService.notification.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
      expect(result).toEqual(notification);
    });
  });

  describe('getNotifications', () => {
    it('should return a list of notifications', async () => {
      const userId = 1;
      const query: GetNotificationDto = {
        skip: 0,
        take: 10,
        searchTerm: 'Test',
      };
      const notifications: Notification[] = [
        { id: 'notification-id' } as Notification,
      ];
      const count = 1;

      prismaService.notification.count = jest.fn().mockResolvedValue(count);
      prismaService.notification.findMany = jest
        .fn()
        .mockResolvedValue(notifications);

      const result = await service.getNotifications(userId, query);

      expect(prismaService.notification.count).toHaveBeenCalledWith({
        where: {
          senderId: userId,
          $or: [{ title: query.searchTerm }, { body: query.searchTerm }],
        },
      });
      expect(prismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          senderId: userId,
          $or: [{ title: query.searchTerm }, { body: query.searchTerm }],
        },
        skip: query.skip,
        take: query.take,
      });
      expect(result).toEqual({
        count,
        data: notifications,
      });
    });
  });

  describe('sendEmail', () => {
    it('should send an email notification', async () => {
      const data: SendEmailDto = {
        /* email data */
      };

      const result = await service.sendEmail(data);

      expect(result).toEqual({
        acknowledged: true,
        status: 'OK',
        transactionId: 'test',
      });
    });
  });

  describe('sendText', () => {
    it('should send a text notification', async () => {
      const data: SendTextDto = {
        /* text data */
      };

      const result = await service.sendText(data);

      expect(result).toEqual({
        acknowledged: true,
        status: 'OK',
        transactionId: 'test',
      });
    });
  });

  describe('sendInApp', () => {
    it('should send an in-app notification', async () => {
      const data: SendInAppDto = {
        /* in-app data */
      };

      const result = await service.sendInApp(data);

      expect(result).toEqual({
        acknowledged: true,
        status: 'OK',
        transactionId: 'test',
      });
    });
  });
});
