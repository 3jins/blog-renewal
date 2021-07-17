import { Types } from 'mongoose';

export interface FindTagByNameDto {
  nameList: string[];
  isOnlyExactNameFound: boolean;
}

export interface FindTagByPostMetaIdDto {
  postMetaIdList: string[];
  isAndCondition: boolean;
}

export interface FindTagRepoParamDto {
  findTagByNameDto?: FindTagByNameDto;
  findTagByPostMetaIdDto?: FindTagByPostMetaIdDto;
}

export interface CreateTagRepoParamDto {
  name: string;
  postMetaList: Types.ObjectId[];
}

export interface TagToBeRepoParamDto {
  name?: string;
  postMetaIdToBeAddedList: string[];
  postMetaIdToBeRemovedList: string[];
}

export interface UpdateTagRepoParamDto {
  originalName: string;
  tagToBe: TagToBeRepoParamDto;
}

export interface DeleteTagRepoParamDto {
  name: string;
}
