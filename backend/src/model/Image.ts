import * as mongoose from 'mongoose';

export interface ImageDoc extends mongoose.Document {
  title: string;
  format: string;
}

export const imageSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  format: { type: String, required: true },
});

export default mongoose.model<ImageDoc>('Image', imageSchema, 'images');
