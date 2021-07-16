import { Document, model, Schema } from 'mongoose';

export interface SeriesDoc extends Document {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: string;
  postMetaList: string[];
}

export const seriesSchema = new Schema({
  name: { type: String, required: true, unique: true },
  thumbnailContent: { type: String, requried: true },
  thumbnailImage: { type: Schema.Types.ObjectId, ref: 'Image' },
  postMetaList: [{ type: Schema.Types.ObjectId, ref: 'postMeta' }],
});

export default model<SeriesDoc>('series', seriesSchema, 'series');
