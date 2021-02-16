import { Service } from 'typedi';
import fs from 'fs';
import { AddPostParamDto } from '@src/post/PostDto';
import PostRepository from '@src/post/PostRepository';

@Service()
export default class PostService {
  public constructor(private readonly postRepository: PostRepository) {
  }

  public createPost = (paramDto: AddPostParamDto): void => {
    const { post } = paramDto;
    const rawContent: string = this.readPostContent(post.path);
    const renderedContent = this.renderContent(rawContent);
    this.postRepository.createPost({
      ...paramDto,
      title: post.name,
      rawContent,
      renderedContent,
    });
  };

  private readPostContent = (path: string): string => fs.readFileSync(path).toString();

  private renderContent = (rawContent: string): string => {
    // TODO: 렌더링 로직 구현
    return rawContent;
  };
}
