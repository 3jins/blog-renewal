import { Types } from 'mongoose';

export interface CreatePostMetaRepoParamDto {
  categoryId?: Types.ObjectId;
  seriesId?: Types.ObjectId;
  tagIdList?: Types.ObjectId[];
  createdDate: Date;
  isPrivate?: boolean;
}
