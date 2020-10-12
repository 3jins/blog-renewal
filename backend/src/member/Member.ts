import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import RoleLevel from '../common/constant/RoleLevel';

export interface MemberDoc extends mongoose.Document {
  memberNo: number;
  authToken?: string;
  name: string;
  mailAddressList?: Array<string>; // All notifications will be sent to these mail addresses.
  mentionNoti?: boolean; // A mail will be sent when others mention the member in comments
  subscriptionNoti?: boolean; // Subscription to all post of this blog
  categoryNoti?: Array<Schema.Types.ObjectId>; // Subscription for specific categories
  tagNoti?: Array<Schema.Types.ObjectId>; // Subscription for specific tags
  seriesNoti?: Array<Schema.Types.ObjectId>; // Subscription for specific series
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
  categoryNoti: [{ type: Schema.Types.ObjectId, ref: 'category' }],
  tagNoti: [{ type: Schema.Types.ObjectId, ref: 'tag' }],
  seriesNoti: [{ type: Schema.Types.ObjectId, ref: 'series' }],
  roleLevel: { type: Number, required: true, default: RoleLevel.ORDINARY },
  isBlocked: { type: Boolean, required: true, default: false },
});

export default mongoose.model<MemberDoc>('Member', memberSchema, 'members');
