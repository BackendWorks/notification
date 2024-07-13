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
import { EventPattern } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/auth.decorator';
import { AllowedRoles } from 'src/decorators/roles.decorator';
import { TransformMessagePayload } from 'src/decorators/payload.decorator';

import { NotificationCreateDto } from '../dtos/notification.create.dto';
import { NotificationService } from '../services/notification.service';
import { SendEmailDto } from '../dtos/notification.send.email.dto';
import { SendTextDto } from '../dtos/notification.send.text.dto';
import { IAuthUser } from '../interfaces/notification.interface';
import { SendInAppDto } from '../dtos/notification.send.inapp.dto';
import {
  NotificationPaginationResponseDto,
  NotificationResponseDto,
} from '../dtos/notification.response.dto';
import { NotificationUpdateDto } from '../dtos/notification.update.dto';
import { NotificationGetDto } from '../dtos/notification.get.dto';

@ApiTags('notification')
@Controller({
  version: '1',
  path: '/notification',
})
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('sendTextMessage')
  async sendText(@TransformMessagePayload() data: SendTextDto) {
    this.notificationService.sendText(data);
  }

  @EventPattern('sendEmail')
  async sendEmail(@TransformMessagePayload() data: SendEmailDto) {
    this.notificationService.sendEmail(data);
  }

  @EventPattern('sendInApp')
  async sendInApp(@TransformMessagePayload() data: SendInAppDto) {
    this.notificationService.sendEmail(data);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Post()
  async createNotification(
    @AuthUser() user: IAuthUser,
    @Body() data: NotificationCreateDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createNotification(user.id, data);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Put(':id')
  async updateNotification(
    @Param('id') notificationId: string,
    @Body() data: NotificationUpdateDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.updateNotification(notificationId, data);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Delete(':id')
  async deleteNotification(@Param('id') notificationId: string): Promise<void> {
    return this.notificationService.deleteNotification(notificationId);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Get(':id')
  async getNotification(
    @AuthUser() user: IAuthUser,
    @Param('id') notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.getNotification(notificationId);
  }

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['Admin'])
  @Get()
  async getNotifications(
    @AuthUser() user: IAuthUser,
    @Query() data: NotificationGetDto,
  ): Promise<NotificationPaginationResponseDto> {
    return this.notificationService.getNotifications(user.id, data);
  }
}
