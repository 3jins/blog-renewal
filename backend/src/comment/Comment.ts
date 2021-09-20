import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';
import { PostDoc } from '@src/post/model/Post';
import { MemberDoc } from '@src/member/Member';

export type CommentDoc = {
  post: PopulatedDoc<PostDoc>;
  member: PopulatedDoc<MemberDoc>;
  refComment?: PopulatedDoc<CommentDoc>;
  lastVersionComment?: PopulatedDoc<CommentDoc>;
  isPostAuthor: boolean;
  content: string;
  createdDate?: Date;
  isLatestVersion?: boolean;
} & Document;

export const commentSchema = new Schema({
  post: { type: Types.ObjectId, ref: 'Post', required: true },
  member: { type: Types.ObjectId, ref: 'Member', required: true },
  refComment: { type: Types.ObjectId, ref: 'Comment', default: null },
  lastVersionComment: { type: Types.ObjectId, ref: 'Comment', default: null },
  isPostAuthor: { type: Boolean, required: true },
  content: { type: String, required: true },
  createdDate: { type: Date, required: true, default: Date.now },
  isLatestVersion: { type: Boolean, required: true, default: true },
});

export default model<CommentDoc>('Comment', commentSchema, 'Comments');
