import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [NotificationController],
  imports: [CommonModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
