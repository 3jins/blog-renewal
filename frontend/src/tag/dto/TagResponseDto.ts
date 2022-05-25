import { PostDto } from '@src/post/dto/PostListResponseDto';

export interface TagDto {
  _id: string,
  name: string;
  postList: PostDto[],
}

export interface TagResponseDto {
  tagList: TagDto[];
}
