import { Types } from 'mongoose';

export interface CreatePostMetaRepoParamDto {
  categoryId?: Types.ObjectId;
  tagIdList?: Types.ObjectId[];
  seriesId?: Types.ObjectId;
  createdDate: Date;
  isPrivate?: boolean;
}
