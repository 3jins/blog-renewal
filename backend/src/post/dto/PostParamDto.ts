import { Types } from 'mongoose';
import { File } from 'formidable';
import Language from '@src/common/constant/Language';

export interface CreateNewPostParamDto {
  // post meta
  categoryName?: string;
  tagNameList?: string[];
  seriesName?: string;
  isPrivate?: boolean;

  // post
  post: File;
  language: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
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
