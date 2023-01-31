import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop()
  content: string;

  @Prop()
  type: string;

  @Prop()
  user_id: number;

  @Prop()
  payload: string;

  @Prop({ default: now() })
  created_at: Date;

  @Prop({ default: now() })
  updated_at: Date;

  @Prop()
  deleted_at?: Date;

  @Prop()
  is_deleted?: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
