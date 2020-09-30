import { Document, model, Schema } from 'mongoose';

export interface TagDoc extends Document {
  name: string;
  postList?: Array<Schema.Types.ObjectId>;
}

export const tagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  postList: [{ type: Schema.Types.ObjectId, ref: 'post' }],
});

export default model<TagDoc & Document>('tag', tagSchema, 'tags');
