export interface FindTagRequestDto {
  isOnlyExactNameFound?: boolean;
  postMetaIdList?: string[];
  isAndCondition?: boolean;
}

export interface CreateTagRequestDto {
  name: string;
  postMetaIdList?: string[];
}

export interface TagToBeRequestDto {
  name?: string;
  postMetaIdToBeAddedList?: string[];
  postMetaIdToBeRemovedList?: string[];
}

export interface UpdateTagRequestDto {
  originalName: string;
  tagToBe: TagToBeRequestDto;
}

export interface DeleteTagRequestDto {
  name: string,
}
