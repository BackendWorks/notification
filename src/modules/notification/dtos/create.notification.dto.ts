import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationSubjectType, NotificationType } from '@prisma/client';
import { IsArray, IsEnum, IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class NotificationCreateDto {
  @ApiProperty({
    example: faker.lorem.sentence(),
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: Array.from({ length: 3 }, () => faker.number.int()),
  })
  @IsNotEmpty()
  @IsArray()
  recipientIds: number[];

  @ApiProperty({
    example: faker.lorem.paragraph(),
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    example: {},
  })
  @IsJSON()
  actionPayload: Record<string, any>;

  @ApiProperty({
    example: NotificationType.Email,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    example: NotificationSubjectType.Welcome,
  })
  @IsNotEmpty()
  @IsEnum(NotificationSubjectType)
  subject: NotificationSubjectType;
}
