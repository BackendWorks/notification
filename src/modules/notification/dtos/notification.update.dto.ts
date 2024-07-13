import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class NotificationUpdateDto {
  @ApiProperty({
    example: faker.lorem.sentence(),
  })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({
    example: faker.lorem.paragraph(),
  })
  @IsOptional()
  @IsString()
  body: string;
}
