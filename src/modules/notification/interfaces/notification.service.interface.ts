import { NotificationCreateDto } from '../dtos/create.notification.dto';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import { INotificationSendResponse } from './notification.interface';
import { SendInAppDto } from '../dtos/send.inapp.dto';
import { GenericResponseDto } from '../dtos/generic.response.dto';
import {
  NotificationPaginationResponseDto,
  NotificationResponseDto,
} from '../dtos/notification.response.dto';

export interface INotificationService {
  createNotification(
    senderId: number,
    data: NotificationCreateDto,
  ): Promise<NotificationResponseDto>;
  updateNotification(
    notificationId: string,
    data: UpdateNotificationDto,
  ): Promise<NotificationResponseDto>;
  deleteNotification(notificationId: string): Promise<GenericResponseDto>;
  getNotification(notificationId: string): Promise<NotificationResponseDto>;
  getNotifications(
    userId: number,
    data: GetNotificationDto,
  ): Promise<NotificationPaginationResponseDto>;
  sendEmail(data: SendEmailDto): Promise<INotificationSendResponse>;
  sendText(data: SendTextDto): Promise<INotificationSendResponse>;
  sendInApp(data: SendInAppDto): Promise<INotificationSendResponse>;
}
