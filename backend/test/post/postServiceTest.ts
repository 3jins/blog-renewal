import { should } from 'chai';
import { deepEqual, instance, mock, verify } from 'ts-mockito';
import PostService from '@src/post/PostService';
import PostRepository from '@src/post/PostRepository';
import { AddPostParamDto, CreatePostRepoParamDto } from '@src/post/PostDto';
import { common as commonTestData } from '@test/data/testData';

describe('PostService test', () => {
  let postService: PostService;
  let postRepository: PostRepository;
  let serviceParamDto: AddPostParamDto;

  before(() => {
    serviceParamDto = {
      title: commonTestData.post1.title,
      rawContent: commonTestData.post1.rawContent,
      language: commonTestData.post1.language,
      thumbnailContent: commonTestData.post1.thumbnailContent,
      createdDate: new Date(),
    };

    postRepository = mock(PostRepository);
    postService = new PostService(instance(postRepository));
    should();
  });

  it('post create test', () => {
    postService.createPost(serviceParamDto);
    const repoParamDto: CreatePostRepoParamDto = {
      ...serviceParamDto,
      renderedContent: serviceParamDto.rawContent,
    };
    verify(postRepository.createPost(deepEqual(repoParamDto))).once();
  });
});
