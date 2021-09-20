import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';
import { PostMetaDoc } from '@src/post/model/PostMeta';

export type TagDoc = {
  name: string;
  postMetaList: PopulatedDoc<PostMetaDoc>[],
} & Document;

export const tagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  postMetaList: { type: [Types.ObjectId], ref: 'PostMeta' },
});

export default model<TagDoc>('Tag', tagSchema, 'Tags');
