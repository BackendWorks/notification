import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, now } from 'mongoose';
import { NotificationType } from './notification.type.schema';
import { Recipients } from './recipients.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: String, required: false })
  title: string;

  @Prop({ type: String, required: false })
  body: string;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: Date, default: now() })
  createdAt: Date;

  @Prop({ type: Date, default: now() })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: String, default: null, required: true })
  senderId: string;

  @Prop({ type: [Types.ObjectId], ref: Recipients.name })
  recipients: Types.ObjectId[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
