import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from 'src/core/core.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CoreModule,
    TerminusModule,
    CommonModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('rmq.uri')}`],
            queue: `${configService.get('rmq.auth')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
