import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EmailType } from '../schema/notification.type.schema';

export class SendEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(EmailType)
  type: EmailType;
}
