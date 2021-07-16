import { Document, model, Schema } from 'mongoose';

export interface TagDoc extends Document {
  name: string;
  postMetaList: string[];
}

export const tagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  postMetaList: [{ type: Schema.Types.ObjectId, ref: 'postMeta' }],
});

export default model<TagDoc>('tag', tagSchema, 'tags');
