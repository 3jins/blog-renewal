import { Document, model, Schema } from 'mongoose';

export interface SeriesDoc extends Document {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: string;
  postList: string[];
}

export const seriesSchema = new Schema({
  name: { type: String, required: true, unique: true },
  thumbnailContent: { type: String, requried: true },
  thumbnailImage: { type: Schema.Types.ObjectId, ref: 'Image' },
  postList: [{ type: Schema.Types.ObjectId, ref: 'post' }],
});

export default model<SeriesDoc>('series', seriesSchema, 'series');
