import { Document, model, Schema } from 'mongoose';
import Language from '../constant/Language';

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
  category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  tagList: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  series: { type: Schema.Types.ObjectId, ref: 'Series', default: null },
  lastVersionPost: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
  title: { type: String, required: true },
  rawContent: { type: String, required: true },
  renderedContent: { type: String, required: true },
  language: { type: String, required: true, default: Language.KO },
  thumbnailContent: { type: String, required: true },
  thumbnailImage: { type: Schema.Types.ObjectId, ref: 'Image' },
  createdDate: { type: Date, required: true, default: Date.now },
  isLatestVersion: { type: Boolean, required: true, default: true },
  isDeleted: { type: Boolean, required: true, default: false },
  commentCount: { type: Number, required: true, default: 0 },
  isPrivate: { type: Boolean, required: true, default: false },
});

export default model<PostDoc>('Post', postSchema, 'posts');
