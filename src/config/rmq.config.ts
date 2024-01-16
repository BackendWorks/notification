import { registerAs } from '@nestjs/config';

export default registerAs(
  'rmq',
  (): Record<string, any> => ({
    uri: process.env.RABBITMQ_URL,
    notification: process.env.RABBITMQ_NOTIFICATION_QUEUE,
    auth: process.env.RABBITMQ_AUTH_QUEUE,
  }),
);
