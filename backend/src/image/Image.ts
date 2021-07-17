import * as mongoose from 'mongoose';

export interface ImageDoc extends mongoose.Document {
  title: string;
  createdDate: Date;
  size: number;
}

export const imageSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  createdDate: { type: Date, required: true },
  size: { type: Number, required: true },
});

export default mongoose.model<ImageDoc>('Image', imageSchema, 'Images');
