import { $Enums, Notification, Prisma, Recipients } from '@prisma/client';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { UserResponseDto } from './user.response.dto';

export class NotificationResponseDto implements Notification {
  actionPayload: Prisma.JsonValue;
  body: string;
  createdAt: Date;
  deletedAt: Date;
  id: string;
  isDeleted: boolean;
  senderId: number;

  @Type(() => UserResponseDto)
  @ValidateNested()
  sender: UserResponseDto;

  subject: $Enums.NotificationSubjectType;
  title: string;
  type: $Enums.NotificationType;
  updatedAt: Date;

  @Type(() => RecipientsResponseDto)
  @ValidateNested()
  recipients: RecipientsResponseDto[];
}

export class RecipientsResponseDto implements Recipients {
  id: string;
  notificationId: string;
  seenByUser: boolean;
  userId: number;
  recipientId: string;

  @Type(() => UserResponseDto)
  @ValidateNested()
  user: UserResponseDto;
}

export class NotificationPaginationResponseDto {
  count: number;

  @Type(() => NotificationResponseDto)
  @ValidateNested()
  data: NotificationResponseDto[];
}
