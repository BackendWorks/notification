import { Controller, Get, Query } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { GetResponse, INotificationPayload } from './types';
import { CurrentUser } from './decorators';
import { Notification } from './app.schema';
import { GetNotificationDto } from './dtos/get-notification.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  public getNotifications(
    @Query() params: GetNotificationDto,
    @CurrentUser() userId: number,
  ): Promise<GetResponse<Notification>> {
    return this.appService.getNotifications(params, userId);
  }

  @EventPattern('send_notification')
  public sendNotification(@Payload() payload: string): void {
    const data = JSON.parse(payload);
    this.appService.createNotification(data);
  }
}
