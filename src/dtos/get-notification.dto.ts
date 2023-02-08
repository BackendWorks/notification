import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  public page: number;

  @ApiProperty()
  @IsNotEmpty()
  public limit: number;
}
