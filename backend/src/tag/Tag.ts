import { Document, model, PopulatedDoc, Schema } from 'mongoose';
import { PostMetaDoc } from '@src/post/model/PostMeta';

export interface TagDoc extends Document {
  name: string;
  postMetaList: PopulatedDoc<PostMetaDoc>,
}

export const tagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  postMetaList: [{ type: 'ObjectId', ref: 'PostMeta' }],
});

export default model<TagDoc>('Tag', tagSchema, 'Tags');
