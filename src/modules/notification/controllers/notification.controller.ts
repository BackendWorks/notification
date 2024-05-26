import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { GetNotificationDto } from '../dtos/get.notification.dto';
import { UpdateNotificationDto } from '../dtos/update.notification.dto';
import { NotificationCreateDto } from '../dtos/create.notification.dto';
import { NotificationService } from '../services/notification.service';
import { SendEmailDto } from '../dtos/send.email.dto';
import { SendTextDto } from '../dtos/send.text.dto';
import { IAuthUser } from '../interfaces/notification.interface';
import { SendInAppDto } from '../dtos/send.inapp.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/auth.decorator';
import { AllowedRoles } from 'src/decorators/roles.decorator';
import { Serialize } from 'src/decorators/serialize.decorator';
import {
  NotificationPaginationResponseDto,
  NotificationResponseDto,
} from '../dtos/notification.response.dto';
import { GenericResponseDto } from '../dtos/generic.response.dto';

@ApiTags('notification')
@Controller({
  version: '1',
  path: '/notification',
})
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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

  @EventPattern('sendInApp')
  async sendInApp(@Payload() data: SendInAppDto) {
    const payload = JSON.parse(JSON.stringify(data));
    this.notificationService.sendEmail(payload);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Serialize(NotificationResponseDto)
  @Post()
  async createNotification(
    @AuthUser() user: IAuthUser,
    @Body() data: NotificationCreateDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createNotification(user.id, data);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Serialize(NotificationResponseDto)
  @Put(':id')
  async updateNotification(
    @Param('id') notificationId: string,
    @Body() data: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.updateNotification(notificationId, data);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Serialize(NotificationResponseDto)
  @Delete(':id')
  async deleteNotification(
    @Param('id') notificationId: string,
  ): Promise<GenericResponseDto> {
    return this.notificationService.deleteNotification(notificationId);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Serialize(NotificationResponseDto)
  @Get(':id')
  async getNotification(
    @AuthUser() user: IAuthUser,
    @Param('id') notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.getNotification(notificationId);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Serialize(NotificationPaginationResponseDto)
  @Get()
  async getNotifications(
    @AuthUser() user: IAuthUser,
    @Query() data: GetNotificationDto,
  ): Promise<NotificationPaginationResponseDto> {
    return this.notificationService.getNotifications(user.id, data);
  }
}
