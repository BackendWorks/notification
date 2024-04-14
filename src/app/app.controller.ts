import { Controller, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
// import { TransformPayload } from 'src/core/decorators/message.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { NotificationService } from 'src/modules/notification/services/notification.service';
// import { SendEmailDto, SendInAppDto, SendTextDto } from './app.interfaces';

@Controller()
export class AppController {
  constructor(
    private healthCheckService: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
    private readonly notificationService: NotificationService,
  ) {}

  // @EventPattern('sendTextMessageCall')
  // sendText(@TransformPayload() payload: SendTextDto): void {
  //   this.notificationService.sendText(payload);
  // }

  // @EventPattern('sendEmailCall')
  // sendEmail(@TransformPayload() payload: SendEmailDto): void {
  //   this.notificationService.sendEmail(payload);
  // }

  // @EventPattern('sendInAppCall')
  // sendInApp(@TransformPayload() payload: SendInAppDto): void {
  //   this.notificationService.sendEmail(payload);
  // }

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.mongooseHealth.pingCheck('mongoDB'),
    ]);
  }
}
