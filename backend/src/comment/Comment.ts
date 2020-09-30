import { Document, model, Schema } from 'mongoose';

export interface CommentDoc extends Document {
  post: Schema.Types.ObjectId;
  member: Schema.Types.ObjectId;
  refComment?: Schema.Types.ObjectId;
  lastVersionComment?: Schema.Types.ObjectId;
  isPostAuthor: boolean;
  content: string;
  createdDate?: Date;
  isLatestVersion?: boolean;
}

export const commentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'post', required: true },
  member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  refComment: { type: Schema.Types.ObjectId, ref: 'comment', default: null },
  lastVersionComment: { type: Schema.Types.ObjectId, ref: 'comment', default: null },
  isPostAuthor: { type: Boolean, required: true },
  content: { type: String, required: true },
  createdDate: { type: Date, required: true, default: Date.now },
  isLatestVersion: { type: Boolean, required: true, default: true },
});

export default model<CommentDoc>('comment', commentSchema, 'comments');
