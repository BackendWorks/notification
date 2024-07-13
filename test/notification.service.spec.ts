import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { NotificationCreateDto } from 'src/modules/notification/dtos/notification.create.dto';
import { SendEmailDto } from 'src/modules/notification/dtos/notification.send.email.dto';
import { SendInAppDto } from 'src/modules/notification/dtos/notification.send.inapp.dto';
import { SendTextDto } from 'src/modules/notification/dtos/notification.send.text.dto';
import { NotificationUpdateDto } from 'src/modules/notification/dtos/notification.update.dto';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaService = {
    notification: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    recipients: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  let authClient = {
    send: jest.fn(),
    connect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: authClient,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get(PrismaService);
    authClient = module.get('AUTH_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    const mockNotificationCreateDto = {
      body: 'Test body',
      title: 'Test title',
      type: NotificationType.Email,
      recipientIds: ['1', '2'],
      subject: 'Welcome',
    } as NotificationCreateDto;

    const mockNotification = {
      id: 1,
      ...mockNotificationCreateDto,
      senderId: 100,
      actionPayload: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRecipient = {
      id: 1,
      recipientId: 1,
      seenByUser: false,
      notificationId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    beforeEach(() => {
      prismaService.notification.create.mockResolvedValue(mockNotification);
      prismaService.recipients.create.mockResolvedValue(mockRecipient);
      authClient.send.mockImplementation(() => of(mockUser));
    });

    it('should create a notification', async () => {
      const result = await service.createNotification(
        100,
        mockNotificationCreateDto,
      );

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          title: mockNotificationCreateDto.title,
          body: mockNotificationCreateDto.body,
          type: mockNotificationCreateDto.type,
          senderId: 100,
          actionPayload: {},
          subject: mockNotificationCreateDto.subject,
        },
      });

      expect(result).toHaveProperty('id', mockNotification.id);
      expect(result).toHaveProperty('sender', mockUser);
      expect(result).toHaveProperty('recipients');
      expect(result.recipients).toHaveLength(2);
    });

    it('should create recipients for each recipientId', async () => {
      await service.createNotification(100, mockNotificationCreateDto);

      expect(prismaService.recipients.create).toHaveBeenCalledWith({
        data: {
          recipientId: expect.any(String),
          seenByUser: false,
          notification: { connect: { id: mockNotification.id } },
        },
      });
    });

    it('should fetch user data for sender and recipients', async () => {
      await service.createNotification(100, mockNotificationCreateDto);

      expect(authClient.send).toHaveBeenCalledWith(
        'getUserById',
        JSON.stringify({ userId: 100 }),
      );
      expect(authClient.send).toHaveBeenCalledWith(
        'getUserById',
        JSON.stringify({ userId: 1 }),
      );
      expect(authClient.send).toHaveBeenCalledWith(
        'getUserById',
        JSON.stringify({ userId: 1 }),
      );
    });

    it('should handle errors gracefully', async () => {
      prismaService.notification.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.createNotification(100, mockNotificationCreateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateNotification', () => {
    const notificationId = 'test-id';
    const mockUpdateDto: NotificationUpdateDto = {
      title: 'Updated Title',
      body: 'Updated Body',
    };

    const mockNotification = {
      id: notificationId,
      title: 'Original Title',
      body: 'Original Body',
      senderId: 100,
      type: 'TEST',
      actionPayload: {},
      subject: 'Test Subject',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRecipient = {
      id: 1,
      recipientId: 1,
      seenByUser: false,
      notificationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    beforeEach(() => {
      prismaService.notification.findUnique.mockResolvedValue(mockNotification);
      prismaService.notification.update.mockResolvedValue({
        ...mockNotification,
        ...mockUpdateDto,
      });
      prismaService.recipients.findMany.mockResolvedValue([mockRecipient]);
      authClient.send.mockImplementation(() => of(mockUser));
    });

    it('should update a notification', async () => {
      const result = await service.updateNotification(
        notificationId,
        mockUpdateDto,
      );

      expect(prismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: mockUpdateDto,
      });

      expect(result).toHaveProperty('title', mockUpdateDto.title);
      expect(result).toHaveProperty('body', mockUpdateDto.body);
      expect(result).toHaveProperty('sender', mockUser);
      expect(result).toHaveProperty('recipients');
      expect(result.recipients).toHaveLength(1);
    });

    it('should throw NotFoundException if notification is not found', async () => {
      prismaService.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.updateNotification(notificationId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fetch user data for sender and recipients', async () => {
      await service.updateNotification(notificationId, mockUpdateDto);

      expect(authClient.send).toHaveBeenCalledWith(
        'getUserById',
        JSON.stringify({ userId: 100 }),
      );
      expect(authClient.send).toHaveBeenCalledWith(
        'getUserById',
        JSON.stringify({ userId: 1 }),
      );
    });

    it('should handle multiple recipients', async () => {
      const multipleRecipients = [
        { ...mockRecipient, id: 1, recipientId: 1 },
        { ...mockRecipient, id: 2, recipientId: 2 },
      ];
      prismaService.recipients.findMany.mockResolvedValue(multipleRecipients);

      const result = await service.updateNotification(
        notificationId,
        mockUpdateDto,
      );

      expect(result.recipients).toHaveLength(2);
    });

    it('should handle errors gracefully', async () => {
      prismaService.notification.update.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.updateNotification(notificationId, mockUpdateDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('deleteNotification', () => {
    it('should mark a notification as deleted', async () => {
      const notificationId = 'test-notification-id';
      prismaService.notification.update = jest.fn().mockResolvedValue({});

      await service.deleteNotification(notificationId);

      expect(prismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: {
          deletedAt: new Date(),
          isDeleted: true,
        },
      });
    });

    it('should throw an error if updating the notification fails', async () => {
      const notificationId = 'test-notification-id';
      const error = new Error('Update failed');
      prismaService.notification.update = jest.fn().mockRejectedValue(error);

      await expect(service.deleteNotification(notificationId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getNotification', () => {
    const notificationId = 'test-notification-id';
    const mockNotification = { id: notificationId, senderId: 'sender-id' };
    const mockRecipients = [
      { recipientId: 'recipient-id-1' },
      { recipientId: 'recipient-id-2' },
    ];
    const mockUser = { id: 'user-id', name: 'Test User' };

    beforeEach(() => {
      prismaService.notification.findUnique.mockResolvedValue(mockNotification);
      prismaService.recipients.findMany.mockResolvedValue(mockRecipients);
      authClient.send.mockImplementation(() => of(mockUser));
    });

    it('should return a populated notification', async () => {
      const result = await service.getNotification(notificationId);

      expect(prismaService.notification.findUnique).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
      expect(prismaService.recipients.findMany).toHaveBeenCalledWith({
        where: { notificationId },
      });
      expect(result).toEqual({
        ...mockNotification,
        sender: mockUser,
        recipients: mockRecipients.map((recipient) => ({
          ...recipient,
          user: mockUser,
        })),
      });
    });

    it('should throw an error if finding the notification fails', async () => {
      const error = new Error('Find failed');
      prismaService.notification.findUnique.mockRejectedValue(error);

      await expect(service.getNotification(notificationId)).rejects.toThrow(
        error,
      );
    });

    it('should throw an error if finding recipients fails', async () => {
      const error = new Error('Find recipients failed');
      prismaService.recipients.findMany.mockRejectedValue(error);

      await expect(service.getNotification(notificationId)).rejects.toThrow(
        error,
      );
    });

    it('should throw an error if fetching user data for a recipient fails', async () => {
      const error = new Error('User data fetch failed');
      authClient.send
        .mockImplementationOnce(() => of(mockUser)) // First call for sender
        .mockImplementationOnce(() => of(mockUser)) // Second call for first recipient
        .mockImplementationOnce(() => {
          throw error;
        }); // Third call for second recipient

      await expect(service.getNotification(notificationId)).rejects.toThrow(
        error,
      );
    });

    it('should throw an error if fetching user data for the sender fails', async () => {
      const error = new Error('User data fetch failed');
      authClient.send
        .mockImplementationOnce(() => {
          throw error;
        }) // First call for sender
        .mockImplementation(() => of(mockUser)); // Subsequent calls for recipients

      await expect(service.getNotification(notificationId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getNotifications', () => {
    const userId = 1;
    const query = { skip: 0, take: 10, searchTerm: 'test' };
    const mockNotifications = [
      { id: 'notification-id-1', senderId: 'sender-id-1' },
      { id: 'notification-id-2', senderId: 'sender-id-2' },
    ];
    const mockRecipients = [{ recipientId: 'recipient-id' }];
    const mockUser = { id: 'user-id', name: 'Test User' };
    const mockCount = 2;

    beforeEach(() => {
      prismaService.notification.count.mockResolvedValue(mockCount);
      prismaService.notification.findMany.mockResolvedValue(mockNotifications);
      prismaService.recipients.findMany.mockResolvedValue(mockRecipients);
      authClient.send.mockImplementation(() => of(mockUser));
    });

    it('should return a list of populated notifications', async () => {
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
        count: mockCount,
        data: mockNotifications.map((notification) => ({
          ...notification,
          sender: mockUser,
          recipients: mockRecipients.map((recipient) => ({
            ...recipient,
            user: mockUser,
          })),
        })),
      });
    });

    it('should throw an error if finding notifications fails', async () => {
      const error = new Error('Find failed');
      prismaService.notification.findMany.mockRejectedValue(error);

      await expect(service.getNotifications(userId, query)).rejects.toThrow(
        error,
      );
    });

    it('should throw an error if counting notifications fails', async () => {
      const error = new Error('Count failed');
      prismaService.notification.count.mockRejectedValue(error);

      await expect(service.getNotifications(userId, query)).rejects.toThrow(
        error,
      );
    });

    it('should throw an error if finding recipients fails', async () => {
      const error = new Error('Find recipients failed');
      prismaService.recipients.findMany.mockRejectedValue(error);

      await expect(service.getNotifications(userId, query)).rejects.toThrow(
        error,
      );
    });

    it('should throw an error if fetching user data for a recipient fails', async () => {
      const error = new Error('User data fetch failed');
      authClient.send
        .mockImplementationOnce(() => of(mockUser)) // First call for sender
        .mockImplementationOnce(() => of(mockUser)) // Second call for first recipient
        .mockImplementationOnce(() => {
          throw error;
        }); // Third call for second recipient

      await expect(service.getNotifications(userId, query)).rejects.toThrow(
        error,
      );
    });

    it('should throw an error if fetching user data for the sender fails', async () => {
      const error = new Error('User data fetch failed');
      authClient.send
        .mockImplementationOnce(() => {
          throw error;
        }) // First call for sender
        .mockImplementation(() => of(mockUser)); // Subsequent calls for recipients

      await expect(service.getNotifications(userId, query)).rejects.toThrow(
        error,
      );
    });
  });

  describe('sendEmail', () => {
    it('should send an Email notification', async () => {
      const data: SendEmailDto = {
        /* in-app data */
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
