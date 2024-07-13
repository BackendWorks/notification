import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationSubjectType, NotificationType } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class NotificationCreateDto {
  @ApiProperty({
    example: faker.lorem.sentence(),
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: [],
  })
  @IsNotEmpty()
  @IsArray({
    message: 'ids should be array of string',
  })
  recipientIds: string[];

  @ApiProperty({
    example: faker.lorem.paragraph(),
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    enum: NotificationType,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    enum: NotificationSubjectType,
  })
  @IsNotEmpty()
  @IsEnum(NotificationSubjectType)
  subject: NotificationSubjectType;
}
