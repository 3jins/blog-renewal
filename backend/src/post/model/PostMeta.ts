import { Document, model, PopulatedDoc, Schema } from 'mongoose';
import { SeriesDoc } from '@src/series/Series';
import { TagDoc } from '@src/tag/Tag';
import { CategoryDoc } from '@src/category/Category';

export interface PostMetaDoc extends Document {
  postNo: number;
  category?: PopulatedDoc<CategoryDoc>;
  series?: PopulatedDoc<SeriesDoc>;
  tagList: PopulatedDoc<TagDoc>[];
  createdDate: Date;
  isDeleted?: boolean;
  commentCount?: number;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
}

export const postMetaSchema = new Schema({
  postNo: { type: Number, required: true },
  category: { type: 'ObjectId', ref: 'Category', default: null },
  series: { type: 'ObjectId', ref: 'Series', default: null },
  tagList: [{ type: 'ObjectId', ref: 'Tag', default: [] }],
  createdDate: { type: Date, required: true },
  isDeleted: { type: Boolean, required: false, default: false },
  commentCount: { type: Number, required: false, default: 0 },
  isPrivate: { type: Boolean, required: false, default: false },
  isDeprecated: { type: Boolean, required: false, default: false },
  isDraft: { type: Boolean, required: false, default: false },
});

export default model<PostMetaDoc>('PostMeta', postMetaSchema, 'PostMeta');
