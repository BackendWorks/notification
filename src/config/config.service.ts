import { config } from 'dotenv';
config();
import { Injectable } from '@nestjs/common';

interface Config {
  rb_url: string;
  servicePort: string;
  database_url: string;
  notification_queue: string;
  auth_queue: string;
  env: string;
  redis_host: string;
  redis_port: string;
}

@Injectable()
export class ConfigService {
  private config = {} as Config;
  constructor() {
    this.config.rb_url = process.env.RABBITMQ_URL;
    this.config.servicePort = process.env.PORT;
    this.config.database_url = process.env.DATABASE_URL;
    this.config.notification_queue = process.env.RABBITMQ_NOTIFICATION_QUEUE;
    this.config.auth_queue = process.env.RABBITMQ_AUTH_QUEUE;
    this.config.env = process.env.NODE_ENV;
    this.config.redis_host = process.env.REDIS_HOST;
    this.config.redis_port = process.env.REDIS_PORT;
  }

  public get(key: keyof Config): any {
    return this.config[key];
  }
}
