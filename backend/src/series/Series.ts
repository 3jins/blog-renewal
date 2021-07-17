import { Document, model, PopulatedDoc, Schema } from 'mongoose';
import { PostMetaDoc } from '@src/post/model/PostMeta';
import { ImageDoc } from '@src/image/Image';

export interface SeriesDoc extends Document {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: PopulatedDoc<ImageDoc>[];
  postMetaList: PopulatedDoc<PostMetaDoc>,
}

export const seriesSchema = new Schema({
  name: { type: String, required: true, unique: true },
  thumbnailContent: { type: String, requried: true },
  thumbnailImage: { type: 'ObjectId', ref: 'Image' },
  postMetaList: [{ type: 'ObjectId', ref: 'PostMeta' }],
});

export default model<SeriesDoc>('Series', seriesSchema, 'Series');
