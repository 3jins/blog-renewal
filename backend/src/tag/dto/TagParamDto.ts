export interface FindTagParamDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
  postMetaIdList?: string[];
  isAndCondition?: boolean;
}

export interface CreateTagParamDto {
  name: string;
  postMetaIdList?: string[];
}

export interface TagToBeParamDto {
  name?: string;
  postMetaIdToBeAddedList?: string[];
  postMetaIdToBeRemovedList?: string[];
}

export interface UpdateTagParamDto {
  originalName: string;
  tagToBe: TagToBeParamDto;
}

export interface DeleteTagParamDto {
  name: string;
}
