import { PopulatedDoc } from 'mongoose';
import { CategoryDoc } from '@src/category/Category';
import { SeriesDoc } from '@src/series/Series';
import { TagDoc } from '@src/tag/Tag';
import Language from '@src/common/constant/Language';
import { ImageDoc } from '@src/image/Image';
import { Heading } from '@src/post/model/Post';

export interface PostVersionDataDto {
  title: string;
  rawContent: string;
  renderedContent: string;
  toc: Heading[];
  language: Language;
  thumbnailContent: string;
  thumbnailImage?: PopulatedDoc<ImageDoc>;
  updatedDate: Date;
  isLatestVersion: boolean;
  lastVersionPost: string;
}

export interface PostDto {
  postNo: number;
  category: PopulatedDoc<CategoryDoc>;
  series: PopulatedDoc<SeriesDoc>;
  tagList: PopulatedDoc<TagDoc>[];
  createdDate: Date;
  isDeleted: boolean;
  commentCount: number;
  isPrivate: boolean;
  isDeprecated: boolean;
  isDraft: boolean;
  postVersionDataList: PostVersionDataDto[];
}

export interface FindPostResponseDto {
  postList: PostDto[];
}
