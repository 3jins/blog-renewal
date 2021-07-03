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
  postIdToBeAddedList: string[]; // TODO: service에서 디폴트로 [] 넣는지 테스트할 것
  postIdToBeRemovedList: string[]; // TODO: service에서 디폴트로 [] 넣는지 테스트할 것
}

export interface UpdateSeriesRepoParamDto {
  originalName: string;
  seriesToBe: SeriesToBeRepoParamDto;
}

export interface DeleteSeriesRepoParamDto {
  name: string;
}
