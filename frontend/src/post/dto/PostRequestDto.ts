import Language from '@common/constant/Language';

export interface FindPostRequestDto {
  categoryId?: string;
  seriesId?: string;
  tagIdList?: string[];
  isDeleted?: boolean;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
  postVersionId?: string;
  title?: string;
  rawContent?: string;
  renderedContent?: string;
  language?: string;
  thumbnailContent?: string;
  thumbnailImageId?: string;
  updateDateFrom?: string;
  updateDateTo?: string;
  isLatestVersion?: boolean;
  isOnlyExactSameFieldFound?: boolean;
}

export interface CreateNewPostRequestDto {
  // post meta
  categoryName?: string;
  tagNameList?: string[];
  seriesName?: string;
  isPrivate?: boolean;
  isDraft?: boolean;

  // post
  language: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
}

export interface AddUpdatedVersionPostRequestDto {
  postNo: number;
  language: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
}

export interface UpdatePostMetaDataRequestDto {
  postNo: number;
  categoryName?: string;
  tagNameList?: string[];
  seriesName?: string;
  isDeleted?: boolean;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
}

export interface DeletePostVersionRequestDto {
  postVersionId: string;
}

export interface DeletePostRequestDto {
  postNo: number;
}
