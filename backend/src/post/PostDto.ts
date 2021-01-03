import Language from '@src/common/constant/Language';

export interface AddPostParamDto {
  categoryId?: string;
  tagIdList?: Array<string>;
  seriesId?: string;
  title: string;
  rawContent: string;
  language: Language;
  thumbnailContent: string;
  thumbnailImageId?: string;
  createdDate?: Date;
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
