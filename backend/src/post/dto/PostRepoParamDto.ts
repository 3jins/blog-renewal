import { Types } from 'mongoose';
import Language from '@src/common/constant/Language';

export interface CreatePostRepoParamDto {
  postNo: number;
  title: string;
  rawContent: string;
  renderedContent: string;
  language: Language;
  thumbnailContent: string;
  thumbnailImageId?: Types.ObjectId;
  lastUpdatedDate?: Date;
  isLatestVersion: boolean;
  lastVersionPost?: Types.ObjectId;
}
