import { Document, model, PopulatedDoc, Schema } from 'mongoose';
import { PostDoc } from '@src/post/model/Post';
import { MemberDoc } from '@src/member/Member';

export interface CommentDoc extends Document {
  post: PopulatedDoc<PostDoc>[];
  member: PopulatedDoc<MemberDoc>[];
  refComment?: PopulatedDoc<CommentDoc>[];
  lastVersionComment?: PopulatedDoc<CommentDoc>[];
  isPostAuthor: boolean;
  content: string;
  createdDate?: Date;
  isLatestVersion?: boolean;
}

export const commentSchema = new Schema({
  post: { type: 'ObjectId', ref: 'Post', required: true },
  member: { type: 'ObjectId', ref: 'Member', required: true },
  refComment: { type: 'ObjectId', ref: 'Comment', default: null },
  lastVersionComment: { type: 'ObjectId', ref: 'Comment', default: null },
  isPostAuthor: { type: Boolean, required: true },
  content: { type: String, required: true },
  createdDate: { type: Date, required: true, default: Date.now },
  isLatestVersion: { type: Boolean, required: true, default: true },
});

export default model<CommentDoc>('Comment', commentSchema, 'Comments');
