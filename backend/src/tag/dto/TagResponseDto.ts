import { PostDto } from '@src/post/dto/PostResponseDto';

export interface TagDto {
  name: string;
  postList: PostDto[],
}

export interface FindTagResponseDto {
  tagList: TagDto[];
}
