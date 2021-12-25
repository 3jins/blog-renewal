import { Document, model, Schema, Types } from 'mongoose';
import { PopulatedDoc } from 'mongoose';
import RoleLevel from '../common/constant/RoleLevel';
import { CategoryDoc } from '@src/category/Category';
import { TagDoc } from '@src/tag/Tag';
import { SeriesDoc } from '@src/series/Series';

export interface MemberDoc extends Document {
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

export const memberSchema = new Schema({
  memberNo: { type: Number, required: true },
  authToken: { type: String },
  name: { type: String, required: true },
  mailAddressList: [{ type: String, required: false }],
  mentionNoti: { type: Boolean, default: true },
  subscriptionNoti: { type: Boolean, default: false },
  categoryNoti: { type: [Types.ObjectId], ref: 'Category' },
  tagNoti: { type: [Types.ObjectId], ref: 'Tag' },
  seriesNoti: { type: [Types.ObjectId], ref: 'Series' },
  roleLevel: { type: Number, default: RoleLevel.ORDINARY },
  isBlocked: { type: Boolean, default: false },
});

export default model<MemberDoc>('Member', memberSchema, 'Members');
