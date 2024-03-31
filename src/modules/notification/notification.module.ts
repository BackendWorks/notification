import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [NotificationController],
  imports: [],
  providers: [NotificationService, PrismaService],
})
export class NotificationModule {}
