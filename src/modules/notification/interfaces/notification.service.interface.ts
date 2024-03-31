import { Notification } from '@prisma/client';
import { CreateNotificationDto } from '../dtos/create.notification.dto';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import {
  INotificationGetManyResponse,
  INotificationSendResponse,
  INotificationSuccessResponse,
} from './notification.interface';
import { SendInAppDto } from '../dtos/send.inapp.dto';

export interface INotificationService {
  createNotification(
    senderId: string,
    data: CreateNotificationDto,
  ): Promise<Notification>;
  updateNotification(
    notificationId: string,
    data: UpdateNotificationDto,
  ): Promise<Notification>;
  deleteNotification(
    notificationId: string,
  ): Promise<INotificationSuccessResponse>;
  getNotification(notificationId: string): Promise<Notification>;
  getNotifications(
    userId: string,
    data: GetNotificationDto,
  ): Promise<INotificationGetManyResponse<Notification>>;
  sendEmail(data: SendEmailDto): Promise<INotificationSendResponse>;
  sendText(data: SendTextDto): Promise<INotificationSendResponse>;
  sendInApp(data: SendInAppDto): Promise<INotificationSendResponse>;
}
