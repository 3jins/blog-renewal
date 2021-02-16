import { Service } from 'typedi';
import { AddPostParamDto } from '@src/post/PostDto';
import PostRepository from '@src/post/PostRepository';

@Service()
export default class PostService {
  public constructor(private readonly postRepository: PostRepository) {
  }

  public createPost = (paramDto: AddPostParamDto): void => {
    const { rawContent } = paramDto;
    const renderedContent = this.renderContent(rawContent);
    this.postRepository.createPost({ ...paramDto, renderedContent });
  };

  private renderContent = (rawContent: string): string => {
    return rawContent;
  };
}
