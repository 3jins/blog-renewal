import { Document, model, Schema } from 'mongoose';
import Image from '../image/Image';

export interface SeriesDoc extends Document {
  name: string;
  detail: string;
  thumbnailImage?: Schema.Types.ObjectId;
}

export const seriesSchema = new Schema({
  name: { type: String, required: true, unique: true },
  detail: { type: String, requried: true },
  thumbnailImage: { type: Schema.Types.ObjectId, ref: 'Image' },
});

export default model<SeriesDoc>('series', seriesSchema, 'series');
