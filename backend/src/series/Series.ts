import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';
import { PostMetaDoc } from '@src/post/model/PostMeta';
import { ImageDoc } from '@src/image/Image';

export type SeriesDoc = {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: PopulatedDoc<ImageDoc>;
  postMetaList: PopulatedDoc<PostMetaDoc>[];
} & Document;

export const seriesSchema = new Schema({
  name: { type: String, required: true, unique: true },
  thumbnailContent: { type: String, requried: true },
  thumbnailImage: { type: Types.ObjectId, ref: 'Image' },
  postMetaList: { type: [Types.ObjectId], ref: 'PostMeta' },
});

export default model<SeriesDoc>('Series', seriesSchema, 'Series');
