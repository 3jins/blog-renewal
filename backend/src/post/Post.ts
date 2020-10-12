import { Document, model, Schema } from 'mongoose';
import Language from '../common/constant/Language';

export interface PostDoc extends Document {
  postNo: number;
  category?: Schema.Types.ObjectId;
  tagList?: Array<Schema.Types.ObjectId>;
  series?: Schema.Types.ObjectId;
  lastVersionPost?: Schema.Types.ObjectId;
  title: string;
  rawContent: string;
  renderedContent: string;
  language: Language;
  thumbnailContent: string;
  thumbnailImage?: Schema.Types.ObjectId;
  createdDate?: Date;
  isLatestVersion?: boolean;
  isDeleted?: boolean;
  commentCount?: number;
  isPrivate?: boolean;
}

export const postSchema = new Schema({
  postNo: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'category', default: null },
  tagList: [{ type: Schema.Types.ObjectId, ref: 'tag' }],
  series: { type: Schema.Types.ObjectId, ref: 'series', default: null },
  lastVersionPost: { type: Schema.Types.ObjectId, ref: 'post', default: null },
  title: { type: String, required: true },
  rawContent: { type: String, required: true },
  renderedContent: { type: String, required: true },
  language: { type: String, required: true, default: Language.KO },
  thumbnailContent: { type: String, required: true },
  thumbnailImage: { type: Schema.Types.ObjectId, ref: 'image' },
  createdDate: { type: Date, required: true, default: Date.now },
  isLatestVersion: { type: Boolean, required: true, default: true },
  isDeleted: { type: Boolean, required: true, default: false },
  commentCount: { type: Number, required: true, default: 0 },
  isPrivate: { type: Boolean, required: true, default: false },
});

export default model<PostDoc>('post', postSchema, 'posts');
