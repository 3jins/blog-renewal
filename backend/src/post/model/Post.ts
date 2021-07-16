import { Document, model, Schema } from 'mongoose';
import Language from '@src/common/constant/Language';

export interface PostDoc extends Document {
  postNo: number;
  title: string;
  rawContent: string;
  renderedContent: string;
  language: Language;
  thumbnailContent: string;
  thumbnailImage?: string;
  lastUpdatedDate: Date;
  isLatestVersion: boolean;
  lastVersionPost?: string;
}

export const postSchema = new Schema({
  postNo: { type: Number, required: true },
  title: { type: String, required: true },
  rawContent: { type: String, required: true },
  renderedContent: { type: String, required: true },
  language: { type: String, required: true },
  thumbnailContent: { type: String, required: true },
  thumbnailImage: { type: Schema.Types.ObjectId, ref: 'image', required: false, default: null },
  lastUpdatedDate: { type: Date, required: true },
  isLatestVersion: { type: Boolean, required: true },
  lastVersionPost: { type: Schema.Types.ObjectId, ref: 'post', required: false, default: null },
});

export default model<PostDoc>('post', postSchema, 'posts');
