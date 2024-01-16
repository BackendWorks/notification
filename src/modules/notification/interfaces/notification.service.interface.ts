import { CreateNotificationDto } from '../dtos/create.notification.dto';
import { CreateSubscriberDto } from '../dtos/create.sub.dto';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import { UpdateSubscriberDto } from '../dtos/update.sub.dto';
import { Notification } from '../schema/notification.schema';
import {
  DeleteNotificationResponse,
  NotificationGetManyResponse,
  NotificationSendResponse,
} from './notification.interface';

export interface INotificationService {
  createNotification(
    userId: string,
    data: CreateNotificationDto,
  ): Promise<Notification>;
  updateNotification(data: UpdateNotificationDto): Promise<Notification>;
  deleteNotification(
    notificationId: string,
  ): Promise<DeleteNotificationResponse>;
  createSubscriber(userId: string, data: CreateSubscriberDto): Promise<any>;
  updateSubscriber(subId: string, data: UpdateSubscriberDto): Promise<any>;
  deleteSubscriber(subId: string): Promise<any>;
  getNotification(notificationId: string): Promise<Notification>;
  getNotifications(
    userId: string,
    data: GetNotificationDto,
  ): Promise<NotificationGetManyResponse<Notification>>;
  sendEmail(data: SendEmailDto): Promise<NotificationSendResponse>;
  sendText(data: SendTextDto): Promise<NotificationSendResponse>;
}
