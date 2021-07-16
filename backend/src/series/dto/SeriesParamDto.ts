export interface FindSeriesParamDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
}

export interface CreateSeriesParamDto {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: string;
  postMetaIdList?: string[];
}

export interface SeriesToBeParamDto {
  name?: string;
  thumbnailContent?: string;
  thumbnailImage?: string;
  postMetaIdToBeAddedList?: string[];
  postMetaIdToBeRemovedList?: string[];
}

export interface UpdateSeriesParamDto {
  originalName: string;
  seriesToBe: SeriesToBeParamDto;
}

export interface DeleteSeriesParamDto {
  name: string;
}
