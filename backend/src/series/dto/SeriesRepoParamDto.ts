import { Types } from 'mongoose';

export interface FindSeriesRepoParamDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
}

export interface CreateSeriesRepoParamDto {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: string;
  postMetaList: Types.ObjectId[];
}

export interface SeriesToBeRepoParamDto {
  name?: string;
  thumbnailContent?: string;
  thumbnailImage?: string;
  postMetaIdToBeAddedList: string[];
  postMetaIdToBeRemovedList: string[];
}

export interface UpdateSeriesRepoParamDto {
  originalName: string;
  seriesToBe: SeriesToBeRepoParamDto;
}

export interface DeleteSeriesRepoParamDto {
  name: string;
}
