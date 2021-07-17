import { Document, model, Schema } from 'mongoose';

export interface CategoryDoc extends Document {
  name: string;
  parentCategory?: Schema.Types.ObjectId;
  level?: number;
}

export const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'category', default: null },
  level: { type: Number, default: 0 },
});

export default model<CategoryDoc>('category', categorySchema, 'categories');
