import { NotificationCreateDto } from '../dtos/notification.create.dto';
import { SendEmailDto } from '../dtos/notification.send.email.dto';
import { SendTextDto } from '../dtos/notification.send.text.dto';
import { INotificationSendResponse } from './notification.interface';
import { SendInAppDto } from '../dtos/notification.send.inapp.dto';
import {
  NotificationPaginationResponseDto,
  NotificationResponseDto,
} from '../dtos/notification.response.dto';
import { NotificationUpdateDto } from '../dtos/notification.update.dto';
import { NotificationGetDto } from '../dtos/notification.get.dto';

export interface INotificationService {
  createNotification(
    senderId: number,
    data: NotificationCreateDto,
  ): Promise<NotificationResponseDto>;
  updateNotification(
    notificationId: string,
    data: NotificationUpdateDto,
  ): Promise<NotificationResponseDto>;
  deleteNotification(notificationId: string): Promise<void>;
  getNotification(notificationId: string): Promise<NotificationResponseDto>;
  getNotifications(
    userId: number,
    data: NotificationGetDto,
  ): Promise<NotificationPaginationResponseDto>;
  sendEmail(data: SendEmailDto): Promise<INotificationSendResponse>;
  sendText(data: SendTextDto): Promise<INotificationSendResponse>;
  sendInApp(data: SendInAppDto): Promise<INotificationSendResponse>;
}
