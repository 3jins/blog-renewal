import { Types } from 'mongoose';

export interface FindPostMetaRepoParamDto {
  postNo?: number;
  categoryId?: string;
  seriesId?: string;
  tagIdList?: string[];
  isDeleted?: boolean;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
}

export interface CreatePostMetaRepoParamDto {
  categoryId?: Types.ObjectId;
  seriesId?: Types.ObjectId;
  tagIdList?: Types.ObjectId[];
  createdDate: Date;
  isPrivate?: boolean;
  isDraft?: boolean;
}

export interface UpdatePostMetaRepoParamDto {
  postNo: number;
  categoryId?: Types.ObjectId;
  seriesId?: Types.ObjectId;
  tagIdList?: Types.ObjectId[];
  commentCount?: number;
  isDeleted?: boolean;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
}

export interface DeletePostMetaRepoParamDto {
  postNo: number;
}
