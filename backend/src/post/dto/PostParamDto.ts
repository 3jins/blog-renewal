import { Types } from 'mongoose';
import { File } from 'formidable';
import Language from '@src/common/constant/Language';

export interface CreatePostParamDto {
  // post meta
  categoryName?: string;
  tagNameList?: string[];
  seriesName?: string;
  // createdDate: Date;
  // isDeleted?: boolean;
  // commentCount?: number;
  isPrivate?: boolean;
  // isDeprecated?: boolean;

  // post
  post: File;
  title: string;
  // rawContent: string;
  // renderedContent: string;
  language: Language;
  thumbnailContent: string;
  thumbnailImageId?: string;
  // lastUpdatedDate: Date;
  // isLatestVersion: boolean;
  // lastVersionPost?: string;
}

export interface AddPostParamDto {
  post: File;
  title: string;
  rawContent: string;
  renderedContent: string;
  isLatestVersion: boolean;
  createdDate: Date;
  lastVersionPost?: Types.ObjectId;
}
