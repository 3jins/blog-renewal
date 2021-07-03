import { Types } from 'mongoose';

export interface FindTagByNameDto {
  name: string;
  isOnlyExactNameFound: boolean;
}

export interface FindTagByPostIdDto {
  postIdList: string[];
  isAndCondition: boolean;
}

export interface FindTagRepoParamDto {
  findTagByNameDto?: FindTagByNameDto;
  findTagByPostIdDto?: FindTagByPostIdDto;
}

export interface CreateTagRepoParamDto {
  name: string;
  postList: Types.ObjectId[];
}

export interface TagToBeRepoParamDto {
  name?: string;
  postIdToBeAddedList: string[];
  postIdToBeRemovedList: string[];
}

export interface UpdateTagRepoParamDto {
  originalName: string;
  tagToBe: TagToBeRepoParamDto;
}

export interface DeleteTagRepoParamDto {
  name: string;
}
