import { Types } from 'mongoose';

export interface FindSeriesRepoParamDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
}

export interface CreateSeriesRepoParamDto {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: string;
  postList: Types.ObjectId[];
}

export interface SeriesToBeRepoParamDto {
  name?: string;
  thumbnailContent?: string;
  thumbnailImage?: string;
  postIdToBeAddedList: string[];
  postIdToBeRemovedList: string[];
}

export interface UpdateSeriesRepoParamDto {
  originalName: string;
  seriesToBe: SeriesToBeRepoParamDto;
}

export interface DeleteSeriesRepoParamDto {
  name: string;
}
