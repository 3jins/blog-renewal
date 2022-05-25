import { File } from 'formidable';
import Language from '@common/constant/Language';
import PostType from '@common/constant/PostType';

export interface FindPostParamDto {
  postNo?: number;
  categoryId?: string;
  seriesId?: string;
  tagIdList?: string[];
  isDeleted?: boolean;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
  postType?: PostType;
  postVersionId?: string;
  title?: string;
  rawContent?: string;
  renderedContent?: string;
  language?: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
  updateDateFrom?: Date;
  updateDateTo?: Date;
  isLatestVersion?: boolean;
  isOnlyExactSameFieldFound?: boolean;
}

export interface GetPostPreviewParamDto {
  post: File,
}

export interface CreateNewPostParamDto {
  // post meta
  categoryName?: string;
  seriesName?: string;
  tagNameList?: string[];
  isPrivate?: boolean;
  isDraft?: boolean;
  postType?: PostType;

  // post
  post: File;
  language: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
}

export interface AddUpdatedVersionPostParamDto {
  postNo: number;
  post: File;
  language: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
}

export interface UpdatePostMetaDataParamDto {
  postNo: number;
  categoryName?: string;
  seriesName?: string;
  tagNameList?: string[];
  isDeleted?: boolean;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
  postType?: PostType;
}

export interface DeletePostVersionParamDto {
  postVersionId: string;
}

export interface DeletePostParamDto {
  postNo: number;
}
