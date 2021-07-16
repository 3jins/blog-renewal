import { Types } from 'mongoose';
import { File } from 'formidable';

export interface CreatePostParamDto {
  post: File;
  title: string;
  rawContent: string;
  renderedContent: string;
  isLatestVersion: boolean;
  lastVersionPost?: Types.ObjectId;
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
