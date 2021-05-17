export interface FindTagParamDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
  postIdList?: string[];
  isAndCondition?: boolean;
}

export interface CreateTagParamDto {
  name: string;
  postIdList: string[];
}

export interface TagToBeParamDto {
  name?: string;
  postIdList?: string[];
}

export interface UpdateTagParamDto {
  originalName: string;
  tagToBe: TagToBeParamDto;
}

export interface DeleteTagParamDto {
  name: string;
}
