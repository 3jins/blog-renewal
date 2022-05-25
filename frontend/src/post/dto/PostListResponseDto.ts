import Language from '@common/constant/Language';
import { TagDto } from '@src/tag/dto/TagResponseDto';
import { SeriesDto } from '@src/series/dto/SeriesResponseDto';
import { CategoryDto } from '@src/category/dto/CategoryResponseDto';
import { ImageDto } from '@src/image/dto/ImageResponseDto';

export interface Heading {
  depth: number;
  text: string;
}

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

export interface PostListResponseDto {
  postList: PostDto[];
}

export interface PostPreviewResponseDto {
  title: string;
  rawContent: string;
  renderedContent: string;
  toc: Heading[];
}
