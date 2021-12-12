import { File } from 'formidable';
import Language from '@src/common/constant/Language';

export interface FindPostParamDto {
  postNo?: number;
  categoryId?: string;
  seriesId?: string;
  tagIdList?: string[];
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
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

export interface CreateNewPostParamDto {
  // post meta
  categoryName?: string;
  seriesName?: string;
  tagNameList?: string[];
  isPrivate?: boolean;
  isDraft?: boolean;

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
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
}

export interface DeletePostVersionParamDto {
  postVersionId: string;
}

export interface DeletePostParamDto {
  postNo: number;
}
