import Language from '@src/common/constant/Language';
import { File } from 'formidable';

export interface AddPostParamDto {
  post: File;
  categoryId?: string;
  tagIdList?: Array<string>;
  seriesId?: string;
  language: Language;
  thumbnailContent: string;
  thumbnailImageId?: string;
  isPrivate?: boolean;
}

export interface CreatePostRepoParamDto {
  categoryId?: string;
  tagIdList?: Array<string>;
  seriesId?: string;
  title: string;
  rawContent: string;
  renderedContent: string;
  language: Language;
  thumbnailContent: string;
  thumbnailImageId?: string;
  createdDate?: Date;
  isPrivate?: boolean;
}
