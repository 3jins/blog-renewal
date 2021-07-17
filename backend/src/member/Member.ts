import * as mongoose from 'mongoose';
import { PopulatedDoc } from 'mongoose';
import RoleLevel from '../common/constant/RoleLevel';
import { CategoryDoc } from '@src/category/Category';
import { TagDoc } from '@src/tag/Tag';
import { SeriesDoc } from '@src/series/Series';

export interface MemberDoc extends mongoose.Document {
  memberNo: number;
  authToken?: string;
  name: string;
  mailAddressList?: Array<string>; // All notifications will be sent to these mail addresses.
  mentionNoti?: boolean; // A mail will be sent when others mention the member in comments
  subscriptionNoti?: boolean; // Subscription to all post of this blog
  categoryNoti?: PopulatedDoc<CategoryDoc>[]; // Subscription for specific categories
  tagNoti?: PopulatedDoc<TagDoc>[]; // Subscription for specific tags
  seriesNoti?: PopulatedDoc<SeriesDoc>[]; // Subscription for specific series
  roleLevel?: RoleLevel;
  isBlocked?: boolean;
}

export const memberSchema = new mongoose.Schema({
  memberNo: { type: Number, required: true },
  authToken: { type: String },
  name: { type: String, required: true },
  mailAddressList: [{ type: String, required: false }],
  mentionNoti: { type: Boolean, required: true, default: true },
  subscriptionNoti: { type: Boolean, required: true, default: false },
  categoryNoti: [{ type: 'ObjectId', ref: 'Category' }],
  tagNoti: [{ type: 'ObjectId', ref: 'Tag' }],
  seriesNoti: [{ type: 'ObjectId', ref: 'Series' }],
  roleLevel: { type: Number, required: true, default: RoleLevel.ORDINARY },
  isBlocked: { type: Boolean, required: true, default: false },
});

export default mongoose.model<MemberDoc>('Member', memberSchema, 'Members');
