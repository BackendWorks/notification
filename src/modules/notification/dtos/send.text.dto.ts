import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TextType } from '../schema/notification.type.schema';

export class SendTextDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(TextType)
  type: TextType;
}
