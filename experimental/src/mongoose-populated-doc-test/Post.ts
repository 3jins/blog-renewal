import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';
import { TagDoc } from './Tag';

export type PostDoc = {
  title: string;
  content: string;
  tagList: PopulatedDoc<TagDoc>[];
} & Document;

export const postSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tagList: { type: [Types.ObjectId], ref: 'Tag', required: false, default: [] },
});

export default model<PostDoc>('Post', postSchema, 'Posts');
