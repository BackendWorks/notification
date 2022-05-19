import { config } from 'dotenv';
config();
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private config: { [key: string]: any } = {};
  constructor() {
    this.config.rb_url = process.env.RABBITMQ_URL;
    this.config.servicePort = process.env.NOTIFICATION_PORT;
    this.config.database_uri = process.env.NOTIFICATION_MONGO_URI;
    this.config.notification_queue = process.env.RABBITMQ_NOTIFICATION_QUEUE;
    this.config.token_queue = process.env.RABBITMQ_TOKEN_QUEUE;
    this.config.env = process.env.NODE_ENV;
    this.config.redis_host = process.env.REDIS_HOST;
    this.config.redis_port = process.env.REDIS_PORT;
  }

  public get(key: string): any {
    return this.config[key];
  }
}
