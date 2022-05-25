import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';
import { SeriesDoc } from '@src/series/Series';
import { TagDoc } from '@src/tag/Tag';
import { CategoryDoc } from '@src/category/Category';
import PostType from '@common/constant/PostType';

export type PostMetaDoc = {
  postNo: number;
  category?: PopulatedDoc<CategoryDoc>;
  series?: PopulatedDoc<SeriesDoc>;
  tagList?: PopulatedDoc<TagDoc>[];
  createdDate: Date;
  isDeleted?: boolean;
  commentCount?: number;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
  postType?: string;
} & Document;

export const postMetaSchema = new Schema({
  postNo: { type: Number, required: true },
  category: { type: Types.ObjectId, ref: 'Category', required: false, default: null },
  series: { type: Types.ObjectId, ref: 'Series', drequired: false, efault: null },
  tagList: { type: [Types.ObjectId], ref: 'Tag', rrequired: false, equired: false, default: [] },
  createdDate: { type: Date, required: true },
  isDeleted: { type: Boolean, required: false, default: false },
  commentCount: { type: Number, required: false, default: 0 },
  isPrivate: { type: Boolean, required: false, default: false },
  isDeprecated: { type: Boolean, required: false, default: false },
  isDraft: { type: Boolean, required: false, default: false },
  postType: { type: String, required: false, default: PostType.POST },
});

export default model<PostMetaDoc>('PostMeta', postMetaSchema, 'PostMeta');
