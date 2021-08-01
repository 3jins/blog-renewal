import { Document, model, PopulatedDoc, Schema } from 'mongoose';

export interface CategoryDoc extends Document {
  name: string;
  parentCategory?: PopulatedDoc<CategoryDoc>;
  level?: number;
}

export const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  parentCategory: { type: 'ObjectId', ref: 'Category', default: null },
  level: { type: Number, default: 0 },
});

export default model<CategoryDoc>('Category', categorySchema, 'Categories');
