import Language from '@src/common/constant/Language';
import { Heading } from '@src/post/model/PostVersion';
import { TagDto } from '@src/tag/dto/TagResponseDto';
import { SeriesDto } from '@src/series/dto/SeriesResponseDto';
import { CategoryDto } from '@src/category/dto/CategoryResponseDto';
import { ImageDto } from '@src/image/dto/ImageResponseDto';

export interface PostVersionDto {
  title: string;
  rawContent: string;
  renderedContent: string;
  toc: Heading[];
  language: Language;
  thumbnailContent: string;
  thumbnailImage?: ImageDto;
  updatedDate: Date;
  isLatestVersion: boolean;
  lastPostVersion: string;
}

export interface PostDto {
  postNo: number;
  category: CategoryDto;
  series: SeriesDto;
  tagList: TagDto[];
  createdDate: Date;
  isDeleted: boolean;
  commentCount: number;
  isPrivate: boolean;
  isDeprecated: boolean;
  isDraft: boolean;
  postVersionList: PostVersionDto[];
}

export interface FindPostResponseDto {
  postList: PostDto[];
}

export interface GetPostPreviewResponseDto {
  title: string;
  rawContent: string;
  renderedContent: string;
  toc: Heading[];
}
