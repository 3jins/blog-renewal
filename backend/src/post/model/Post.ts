import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';
import Language from '@src/common/constant/Language';
import { ImageDoc } from '@src/image/Image';

export interface Heading {
  depth: number;
  text: string;
}

export type PostDoc = {
  postNo: number;
  title: string;
  rawContent: string;
  renderedContent: string;
  toc: Heading[];
  language: Language;
  thumbnailContent: string;
  thumbnailImage?: PopulatedDoc<ImageDoc>;
  updatedDate: Date;
  isLatestVersion: boolean;
  lastVersionPost?: PopulatedDoc<PostDoc>;
} & Document;

export const postSchema = new Schema({
  postNo: { type: Number, required: true },
  title: { type: String, required: true },
  rawContent: { type: String, required: true },
  renderedContent: { type: String, required: true },
  toc: [{ depth: { type: Number }, text: { type: String } }],
  language: { type: String, required: true },
  thumbnailContent: { type: String, required: true },
  thumbnailImage: { type: Types.ObjectId, ref: 'Image', required: false, default: null },
  updatedDate: { type: Date, required: true },
  isLatestVersion: { type: Boolean, required: true },
  lastVersionPost: { type: Types.ObjectId, ref: 'Post', required: false, default: null },
});

export default model<PostDoc>('Post', postSchema, 'Posts');
