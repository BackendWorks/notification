import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configs from '../config';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
  exports: [PrismaService],
  providers: [PrismaService],
})
export class CommonModule {}
