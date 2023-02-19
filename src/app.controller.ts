import { Controller, Get, Query } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { GetResponse } from './types';
import { CurrentUser, Public } from './decorators';
import { Notification } from './app.schema';
import { GetNotificationDto } from './dtos/get-notification.dto';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private healthCheckService: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
  ) {}

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.mongooseHealth.pingCheck('mongoDB'),
    ]);
  }

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
