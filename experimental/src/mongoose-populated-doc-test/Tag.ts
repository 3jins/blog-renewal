import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';

export type TagDoc = {
  name: string;
} & Document;

export const tagSchema = new Schema({
  name: { type: String, required: true },
});

export default model<TagDoc>('Tag', tagSchema, 'Tags');
