import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';

export type CategoryDoc = {
  name: string;
  parentCategory?: PopulatedDoc<CategoryDoc>;
  level?: number;
} & Document;

export const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  parentCategory: { type: Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 0 },
});

export default model<CategoryDoc>('Category', categorySchema, 'Categories');
