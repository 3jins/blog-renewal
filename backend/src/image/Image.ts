import { Document, model, Schema } from 'mongoose';

export type ImageDoc = {
  title: string;
  createdDate: Date;
  size: number;
} & Document;

export const imageSchema = new Schema({
  title: { type: String, required: true, unique: true },
  createdDate: { type: Date, required: true },
  size: { type: Number, required: true },
});

export default model<ImageDoc>('Image', imageSchema, 'Images');
