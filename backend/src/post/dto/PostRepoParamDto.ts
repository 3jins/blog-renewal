import { Types } from 'mongoose';
import Language from '@src/common/constant/Language';
import { Heading } from '@src/post/model/Post';

export interface CreatePostRepoParamDto {
  postNo: number;
  title: string;
  rawContent: string;
  renderedContent: string;
  toc: Heading[];
  language: Language;
  thumbnailContent: string;
  thumbnailImageId?: Types.ObjectId;
  lastUpdatedDate?: Date;
  isLatestVersion: boolean;
  lastVersionPost?: Types.ObjectId;
}
