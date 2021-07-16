import { Types } from 'mongoose';

export interface CreatePostMetaRepoParamDto {
  postNo: number;
  categoryId?: Types.ObjectId;
  tagIdList?: Types.ObjectId[];
  seriesId?: Types.ObjectId;
  createdDate: Date;
  isPrivate?: boolean;
}
