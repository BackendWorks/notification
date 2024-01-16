import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, now } from 'mongoose';

export type RecipientsDocument = HydratedDocument<Recipients>;

@Schema()
export class Recipients {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Boolean, required: false, default: false })
  read: boolean;

  @Prop({ type: Date, default: now() })
  createdAt: Date;

  @Prop({ type: Date, default: now() })
  updatedAt: Date;
}

export const RecipientsSchema = SchemaFactory.createForClass(Recipients);
