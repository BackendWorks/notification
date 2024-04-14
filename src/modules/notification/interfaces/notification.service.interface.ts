import { Notification } from '@prisma/client';
import { CreateNotificationDto } from '../dtos/create.notification.dto';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import {
  INotificationGetManyResponse,
  // INotificationSendResponse,
  INotificationSuccessResponse,
} from './notification.interface';
// import {
//   SendEmailDto,
//   SendInAppDto,
//   SendTextDto,
// } from 'src/app/app.interfaces';

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
  // sendEmail(data: SendEmailDto): Promise<INotificationSendResponse>;
  // sendText(data: SendTextDto): Promise<INotificationSendResponse>;
  // sendInApp(data: SendInAppDto): Promise<INotificationSendResponse>;
}
