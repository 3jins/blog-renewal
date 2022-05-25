import { PostDto } from '@src/post/dto/PostListResponseDto';
import { ImageDto } from '@src/image/dto/ImageResponseDto';

export interface SeriesDto {
  _id: string,
  name: string;
  thumbnailContent: string;
  thumbnailImage?: ImageDto;
  postList: PostDto[];
}

export interface SeriesResponseDto {
  seriesList: SeriesDto[];
}
