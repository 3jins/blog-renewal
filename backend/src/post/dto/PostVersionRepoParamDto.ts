import { Types } from 'mongoose';
import Language from '@common/constant/Language';
import { Heading } from '@src/post/model/PostVersion';

export interface FindPostVersionByUpdatedDateDto {
  from?: Date;
  to?: Date;
}

export interface FindPostVersionRepoParamDto {
  postNo?: number;
  postVersionId?: string;
  title?: string;
  rawContent?: string;
  renderedContent?: string;
  language?: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
  findPostVersionByUpdatedDateDto?: FindPostVersionByUpdatedDateDto;
  isLatestVersion?: boolean;
  isOnlyExactSameFieldFound?: boolean;
}

export interface CreatePostVersionRepoParamDto {
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
  lastPostVersion?: Types.ObjectId;
}

export interface DeletePostVersionRepoParamDto {
  postVersionId: string;
}