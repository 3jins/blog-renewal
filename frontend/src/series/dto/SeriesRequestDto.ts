export interface FindSeriesRequestDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
}

export interface CreateSeriesRequestDto {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: string;
  postMetaIdList?: string[];
}

export interface SeriesToBeRequestDto {
  name?: string;
  thumbnailContent?: string;
  thumbnailImage?: string;
  postMetaIdToBeAddedList?: string[];
  postMetaIdToBeRemovedList?: string[];
}

export interface UpdateSeriesRequestDto {
  originalName: string;
  seriesToBe: SeriesToBeRequestDto;
}

export interface DeleteSeriesRequestDto {
  name: string,
}
