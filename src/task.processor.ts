import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { FirebaseService } from './services';

@Processor('notification-sender')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);
  constructor(private firebaseService: FirebaseService) {}

  @Process()
  handleNotification(data) {
    const { token, content, payload } = data;
    this.firebaseService
      .sendMessage(token, content, payload)
      .then(() => {
        this.logger.log('Notificaiton sent.');
      })
      .catch((e) => {
        this.logger.error('Notification failed.', e);
      });
  }
}
