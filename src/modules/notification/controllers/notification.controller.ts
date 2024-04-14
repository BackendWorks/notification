import { Controller } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller({
  version: '1',
  path: '/notifications',
})
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {
    //
  }
}
