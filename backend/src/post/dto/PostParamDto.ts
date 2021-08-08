import { File } from 'formidable';
import Language from '@src/common/constant/Language';

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
