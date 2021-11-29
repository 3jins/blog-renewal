import { Types } from 'mongoose';
import Language from '@src/common/constant/Language';
import { Heading } from '@src/post/model/Post';

export interface FindPostByUpdatedDateDto {
  from?: Date;
  to?: Date;
}

export interface FindPostRepoParamDto {
  postNo?: number;
  title?: string;
  rawContent?: string;
  renderedContent?: string;
  language?: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
  findPostByUpdatedDateDto?: FindPostByUpdatedDateDto;
  isLatestVersion?: boolean;
  isOnlyExactSameFieldFound?: boolean;
}

export interface CreatePostRepoParamDto {
  postNo: number;
  title: string;
  rawContent: string;
  renderedContent: string;
  toc: Heading[];
  language: Language;
  thumbnailContent: string;
  thumbnailImageId?: Types.ObjectId;
  updatedDate?: Date;
  isLatestVersion: boolean;
  lastVersionPost?: Types.ObjectId;
}
