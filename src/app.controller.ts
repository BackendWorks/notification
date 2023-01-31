import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { INotificationPayload } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('send_notification')
  public sendNotification(@Payload() payload: INotificationPayload): void {
    this.appService.createNotifications(payload);
  }
}
