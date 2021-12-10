import { PostDto } from '@src/post/dto/PostResponseDto';
import { ImageDto } from '@src/image/dto/ImageResponseDto';

export interface SeriesDto {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: ImageDto;
  postList: PostDto[];
}

export interface FindSeriesResponseDto {
  seriesList: SeriesDto[];
}
