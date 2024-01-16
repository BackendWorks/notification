import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { AuthUser } from 'src/core/decorators/auth.user.decorator';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import { CreateNotificationDto } from '../dtos/create.notification.dto';
import { NotificationService } from '../services/notification.service';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { IAuthUser } from '../interfaces/notification.interface';

@Controller({
  version: '1',
  path: '/notification',
})
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {
    //
  }

  @MessagePattern('createNotification')
  async createNotificationPattern(@Payload() data) {
    const payload = JSON.parse(JSON.stringify(data));
    const { userId } = payload;
    return this.notificationService.createNotification(userId, payload);
  }

  @MessagePattern('updateNotification')
  async updateNotificationPattern(@Payload() data: UpdateNotificationDto) {
    const payload = JSON.parse(JSON.stringify(data));
    return this.notificationService.updateNotification(payload);
  }

  @MessagePattern('deleteNotification')
  async deleteNotificationPattern(@Payload() notificationId: string) {
    return this.notificationService.deleteNotification(notificationId);
  }

  @EventPattern('sendTextMessage')
  async sendText(@Payload() data: SendTextDto) {
    const payload = JSON.parse(JSON.stringify(data));
    this.notificationService.sendText(payload);
  }

  @EventPattern('sendEmail')
  async sendEmail(@Payload() data: SendEmailDto) {
    const payload = JSON.parse(JSON.stringify(data));
    this.notificationService.sendEmail(payload);
  }

  @Post()
  async createNotification(
    @AuthUser() user: IAuthUser,
    data: CreateNotificationDto,
  ) {
    return this.notificationService.createNotification(user.id, data);
  }

  @Put()
  async updateNotification(
    @AuthUser() user: IAuthUser,
    data: UpdateNotificationDto,
  ) {
    return this.notificationService.updateNotification(data);
  }

  @Delete()
  async deleteNotification(
    @AuthUser() user: IAuthUser,
    @Param('id') notificationId: string,
  ) {
    return this.notificationService.deleteNotification(notificationId);
  }

  @Get(':id')
  async getNotification(
    @AuthUser() user: IAuthUser,
    @Param('id') notificationId: string,
  ) {
    return this.notificationService.getNotification(notificationId);
  }

  @Get()
  async getNotifications(
    @AuthUser() user: IAuthUser,
    @Query() data: GetNotificationDto,
  ) {
    return this.notificationService.getNotifications(user.id, data);
  }
}
