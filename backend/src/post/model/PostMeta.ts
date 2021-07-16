import { Document, model, Schema } from 'mongoose';

export interface PostMetaDoc extends Document {
  postNo: number;
  category?: string;
  tagList?: string[];
  series?: string | null;
  createdDate: Date;
  isDeleted?: boolean;
  commentCount?: number;
  isPrivate?: boolean;
  isDeprecated?: boolean;
}

export const postMetaSchema = new Schema({
  postNo: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'category', default: null },
  tagList: [{ type: Schema.Types.ObjectId, ref: 'tag' }],
  series: { type: Schema.Types.ObjectId, ref: 'series', default: null },
  createdDate: { type: Date, required: true },
  isDeleted: { type: Boolean, required: false, default: false },
  commentCount: { type: Number, required: false, default: 0 },
  isPrivate: { type: Boolean, required: false, default: false },
  isDeprecated: { type: Boolean, required: false, default: false },
});

export default model<PostMetaDoc>('postMeta', postMetaSchema, 'postMeta');
