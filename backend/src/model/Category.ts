import { Document, model, Schema } from 'mongoose';
import { Category } from './index';

export interface CategoryDoc extends Document {
  categoryNo: number;
  parentCategory?: Schema.Types.ObjectId;
  name: string;
  level?: number;
}

export const categorySchema = new Schema({
  categoryNo: { type: Number, required: true, unique: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  name: { type: String, required: true },
  level: { type: Number, required: true, default: 0 },
});

export default model<CategoryDoc>('Category', categorySchema, 'categories');
