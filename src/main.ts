import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { HttpExceptionFilter, ResponseInterceptor } from './interceptor';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import helmet from 'helmet';

function configureSwagger(app): void {
  const config = new DocumentBuilder()
    .setTitle('notification-service')
    .setDescription('API Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);
}

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(express()),
    {
      bufferLogs: true,
      cors: true,
    },
  );
  app.use(helmet());
  const configService = app.get(ConfigService);
  const moduleRef = app.select(AppModule);
  const reflector = moduleRef.get(Reflector);
  app.useGlobalInterceptors(
    new ResponseInterceptor(reflector),
    new ClassSerializerInterceptor(reflector),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  configureSwagger(app);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`${configService.get('rb_url')}`],
      queue: `${configService.get('notification_queue')}`,
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });
  await app.startAllMicroservices();
  await app.listen(configService.get('servicePort'));
  logger.log('🚀 Notification service started successfully');
}
bootstrap();
