import { should } from 'chai';
import { deepEqual, instance, mock, verify } from 'ts-mockito';
import PostService from '@src/post/PostService';
import PostRepository from '@src/post/PostRepository';
import { AddPostParamDto, CreatePostRepoParamDto } from '@src/post/PostDto';
import { appPath, common as commonTestData } from '@test/data/testData';
import fs from 'fs';
import { File } from 'formidable';
import Language from '@src/common/constant/Language';

describe('PostService test', () => {
  let postService: PostService;
  let postRepository: PostRepository;
  let serviceParamDto: AddPostParamDto;
  let post: File;
  let fileContent: string;

  before(() => {
    const fileName = 'test.md';
    const filePath = `${appPath.testData}/${fileName}`;
    const fileStream: Buffer = fs.readFileSync(filePath);
    fileContent = fileStream.toString();
    const fileStat: fs.Stats = fs.statSync(filePath);
    post = {
      size: fileStream.byteLength,
      path: filePath,
      name: fileName,
      type: 'application/octet-stream',
      lastModifiedDate: fileStat.mtime,
      toJSON(): Object {
        return {};
      },
    };

    serviceParamDto = {
      post,
      seriesId: '1234',
      language: Language.KO,
      thumbnailContent: '뚜샤!',
    };
    postRepository = mock(PostRepository);
    postService = new PostService(instance(postRepository));
    should();
  });

  it('post create test', () => {
    postService.createPost(serviceParamDto);
    const repoParamDto: CreatePostRepoParamDto = {
      ...serviceParamDto,
      title: post.name,
      rawContent: fileContent,
      renderedContent: fileContent,
    };
    verify(postRepository.createPost(deepEqual(repoParamDto))).once();
  });
});
