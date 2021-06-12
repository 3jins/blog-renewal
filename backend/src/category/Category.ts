import { Document, model, Schema } from 'mongoose';

export interface CategoryDoc extends Document {
  categoryNo: number;
  parentCategory?: Schema.Types.ObjectId;
  name: string;
  level?: number;
}

export const categorySchema = new Schema({
  categoryNo: { type: Number, required: true, unique: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'category', default: null },
  name: { type: String, required: true, unique: true },
  level: { type: Number, default: 0 },
});

export default model<CategoryDoc>('category', categorySchema, 'categories');
