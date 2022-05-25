import { Types } from 'mongoose';
import PostType from '@common/constant/PostType';

export interface FindPostMetaRepoParamDto {
  postNo?: number;
  categoryId?: string;
  seriesId?: string;
  tagIdList?: string[];
  isDeleted?: boolean;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
  postType?: PostType;
}

export interface CreatePostMetaRepoParamDto {
  categoryId?: Types.ObjectId;
  seriesId?: Types.ObjectId;
  tagIdList?: Types.ObjectId[];
  createdDate: Date;
  isPrivate?: boolean;
  isDraft?: boolean;
  postType?: PostType;
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
  postType?: PostType;
}

export interface DeletePostMetaRepoParamDto {
  postNo: number;
}
