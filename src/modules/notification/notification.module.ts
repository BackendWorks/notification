import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { Recipients, RecipientsSchema } from './schema/recipients.schema';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { NovuProvider } from './providers/novu.provider';

@Module({
  controllers: [NotificationController],
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Recipients.name, schema: RecipientsSchema },
    ]),
  ],
  providers: [NotificationService, NovuProvider],
})
export class NotificationModule {}
