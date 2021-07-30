import { should } from 'chai';
import { anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import fs from 'fs';
import { File } from 'formidable';
import PostService from '@src/post/PostService';
import PostMetaRepository from '@src/post/repository/PostMetaRepository';
import PostRepository from '@src/post/repository/PostRepository';
import CategoryRepository from '@src/category/CategoryRepository';
import SeriesRepository from '@src/series/SeriesRepository';
import TagRepository from '@src/tag/TagRepository';
import { CreatePostRepoParamDto } from '@src/post/dto/PostRepoParamDto';
import { CreateNewPostParamDto } from '@src/post/dto/PostParamDto';
import { appPath, common as commonTestData } from '@test/data/testData';
import { CreatePostMetaRepoParamDto } from '@src/post/dto/PostMetaRepoParamDto';
import { CategoryDoc } from '@src/category/Category';
import { SeriesDoc } from '@src/series/Series';
import { TagDoc } from '@src/tag/Tag';
import { errorShouldBeThrown, extractFileInfoFromRawFile } from '@test/TestUtil';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

describe('PostService test', () => {
  let postService: PostService;
  let postMetaRepository: PostMetaRepository;
  let postRepository: PostRepository;
  let categoryRepository: CategoryRepository;
  let seriesRepository: SeriesRepository;
  let tagRepository: TagRepository;

  before(() => {
    should();
  });

  beforeEach(() => {
    postMetaRepository = spy(mock(PostMetaRepository));
    postRepository = spy(mock(PostRepository));
    categoryRepository = mock(CategoryRepository);
    seriesRepository = mock(SeriesRepository);
    tagRepository = mock(TagRepository);
    postService = new PostService(
      instance(postMetaRepository),
      instance(postRepository),
      instance(categoryRepository),
      instance(seriesRepository),
      instance(tagRepository),
    );
  });

  describe('createNewPost test', () => {
    let gifImageId: string;
    let file: File;
    let fileContent: string;

    beforeEach(async () => {
      [gifImageId] = commonTestData.objectIdList;

      ({ file, fileContent } = extractFileInfoFromRawFile('gfm+.md'));
    });

    it('createNewPost test - categoryName: X, seriesName: X, tagNameList: X, isPrivate: X, thumbnailImageId: X', async () => {
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1,
      };
      when(postMetaRepository.createPostMeta(anything()))
        .thenResolve(commonTestData.post1.postNo);

      const date1 = new Date();
      await postService.createNewPost(serviceParamDto);
      const date2 = new Date();

      verify(postMetaRepository.createPostMeta(anything())).once();
      const [createPostMetaRepoParamDto] = capture<CreatePostMetaRepoParamDto>(postMetaRepository.createPostMeta).first();
      (createPostMetaRepoParamDto.categoryId === undefined).should.be.true;
      (createPostMetaRepoParamDto.seriesId === undefined).should.be.true;
      (createPostMetaRepoParamDto.tagIdList === undefined).should.be.true;
      createPostMetaRepoParamDto.createdDate.should.within(date1, date2);
      createPostMetaRepoParamDto.isPrivate!.should.be.false;

      verify(postRepository.createPost(anything())).once();
      const [createPostRepoParamDto] = capture<CreatePostRepoParamDto>(postRepository.createPost).last();
      createPostRepoParamDto.postNo.should.equal(1);
      createPostRepoParamDto.title.should.equal(file.name);
      createPostRepoParamDto.rawContent.should.equal(fileContent);
      createPostRepoParamDto.renderedContent.should.not.be.empty;
      createPostRepoParamDto.renderedContent.should.not.equal(fileContent);
      createPostRepoParamDto.language.should.equal(commonTestData.post1.language);
      createPostRepoParamDto.thumbnailContent.should.equal(commonTestData.post1.thumbnailContent);
      (createPostRepoParamDto.thumbnailImageId === undefined).should.be.true;
      createPostRepoParamDto.isLatestVersion.should.be.true;
      (createPostRepoParamDto.lastVersionPost === undefined).should.be.true;
      createPostRepoParamDto.lastUpdatedDate!.should.within(date1, date2);
    });

    it('createNewPost test - categoryName: O, seriesName: O, tagNameList: O, isPrivate: O, thumbnailImageId: O', async () => {
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1,
        thumbnailImageId: gifImageId,
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
        isPrivate: true,
      };
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name })))
        .thenResolve([{ _id: commonTestData.objectIdList[0] } as CategoryDoc]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name })))
        .thenResolve([{ _id: commonTestData.objectIdList[1] } as SeriesDoc]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      })))
        .thenResolve([
          { _id: commonTestData.objectIdList[2], name: commonTestData.tag1.name } as TagDoc,
          { _id: commonTestData.objectIdList[3], name: commonTestData.tag2.name } as TagDoc,
        ]);
      when(postMetaRepository.createPostMeta(anything()))
        .thenResolve(commonTestData.post1.postNo);

      const date1 = new Date();
      await postService.createNewPost(serviceParamDto);
      const date2 = new Date();

      verify(postMetaRepository.createPostMeta(anything())).once();
      const [createPostMetaRepoParamDto] = capture<CreatePostMetaRepoParamDto>(postMetaRepository.createPostMeta).first();
      createPostMetaRepoParamDto.categoryId!.should.equal(commonTestData.objectIdList[0]);
      createPostMetaRepoParamDto.seriesId!.should.equal(commonTestData.objectIdList[1]);
      createPostMetaRepoParamDto.tagIdList!.should.deep.equal([commonTestData.objectIdList[2], commonTestData.objectIdList[3]]);
      createPostMetaRepoParamDto.createdDate.should.within(date1, date2);
      createPostMetaRepoParamDto.isPrivate!.should.be.true;

      verify(postRepository.createPost(anything())).once();
      const [createPostRepoParamDto] = capture<CreatePostRepoParamDto>(postRepository.createPost).last();
      createPostRepoParamDto.postNo.should.equal(1);
      createPostRepoParamDto.title.should.equal(file.name);
      createPostRepoParamDto.rawContent.should.equal(fileContent);
      createPostRepoParamDto.renderedContent.should.not.be.empty;
      createPostRepoParamDto.renderedContent.should.not.equal(fileContent);
      createPostRepoParamDto.language.should.equal(commonTestData.post1.language);
      createPostRepoParamDto.thumbnailContent.should.equal(commonTestData.post1.thumbnailContent);
      (createPostRepoParamDto.thumbnailImageId!.equals(gifImageId)).should.be.true;
      createPostRepoParamDto.isLatestVersion.should.be.true;
      (createPostRepoParamDto.lastVersionPost === undefined).should.be.true;
      createPostRepoParamDto.lastUpdatedDate!.should.within(date1, date2);
    });

    it('createNewPost test - with inexistent categoryName', async () => {
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1,
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
      };
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name })))
        .thenResolve([]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name })))
        .thenResolve([{ _id: commonTestData.objectIdList[1] } as SeriesDoc]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      })))
        .thenResolve([
          { _id: commonTestData.objectIdList[2], name: commonTestData.tag1.name } as TagDoc,
          { _id: commonTestData.objectIdList[3], name: commonTestData.tag2.name } as TagDoc,
        ]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [commonTestData.category1.name, 'name']),
        (paramDto) => postService.createNewPost(paramDto),
        serviceParamDto,
      );
    });

    it('createNewPost test - with inexistent seriesName', async () => {
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1,
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
      };
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name })))
        .thenResolve([{ _id: commonTestData.objectIdList[0] } as CategoryDoc]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name })))
        .thenResolve([]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      })))
        .thenResolve([
          { _id: commonTestData.objectIdList[2], name: commonTestData.tag1.name } as TagDoc,
          { _id: commonTestData.objectIdList[3], name: commonTestData.tag2.name } as TagDoc,
        ]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.SERIES_NOT_FOUND, [commonTestData.series1.name, 'name']),
        (paramDto) => postService.createNewPost(paramDto),
        serviceParamDto,
      );
    });

    it('createNewPost test - with inexistent tagNames', async () => {
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1,
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
      };
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name })))
        .thenResolve([{ _id: commonTestData.objectIdList[0] } as CategoryDoc]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name })))
        .thenResolve([{ _id: commonTestData.objectIdList[1] } as SeriesDoc]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      })))
        .thenResolve([{ _id: commonTestData.objectIdList[3], name: commonTestData.tag2.name } as TagDoc]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.TAG_NOT_FOUND, ['name', `${commonTestData.tag1.name}`]),
        (paramDto) => postService.createNewPost(paramDto),
        serviceParamDto,
      );
    });
  });

  describe('content rendering test', () => {
    let fileName: string;
    let renderedHtml: string;

    before(() => {
      fs.writeFileSync(
        `${appPath.renderedHtml}/md.css`,
        'table {border-collapse: collapse; width: 100%;} td,th {border: 1px solid black;}',
      );
    });

    afterEach(() => {
      fs.writeFileSync(
        `${appPath.renderedHtml}/${fileName}.html`,
        `<html><head lang="ko"><meta charset="UTF-8"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.min.css" integrity="sha384-RZU/ijkSsFbcmivfdRBQDtwuwVqK7GMOw6IMvKyeWL2K5UAlyp6WonmB8m7Jd0Hn" crossorigin="anonymous"><link rel="stylesheet" type="text/css" href="md.css"/><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.1.0/styles/monokai.min.css"></head><body>${renderedHtml}</body></html>`, // eslint-disable-line
      );
    });

    it('content rendering test - GFM + alpha', async () => {
      // TODO: toc 렌더링하는 것도 추가
      fileName = 'gfm+';
      const { file } = extractFileInfoFromRawFile(`${fileName}.md`);
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1,
      };
      when(postMetaRepository.createPostMeta(anything()))
        .thenResolve(commonTestData.post1.postNo);

      await postService.createNewPost(serviceParamDto);

      verify(postRepository.createPost(anything())).once();
      const [createPostRepoParamDto] = capture<CreatePostRepoParamDto>(postRepository.createPost).last();
      renderedHtml = createPostRepoParamDto.renderedContent;
    });

    it('content rendering test - code blocks', async () => {
      fileName = 'code';
      const { file } = extractFileInfoFromRawFile(`${fileName}.md`);
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1,
      };
      when(postMetaRepository.createPostMeta(anything()))
        .thenResolve(commonTestData.post1.postNo);

      await postService.createNewPost(serviceParamDto);

      verify(postRepository.createPost(anything())).once();
      const [createPostRepoParamDto] = capture<CreatePostRepoParamDto>(postRepository.createPost).last();
      renderedHtml = createPostRepoParamDto.renderedContent;
    });

    it('content rendering test - mathematical expressions', async () => {
      fileName = 'math';
      const { file } = extractFileInfoFromRawFile(`${fileName}.md`);
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1,
      };
      when(postMetaRepository.createPostMeta(anything()))
        .thenResolve(commonTestData.post1.postNo);

      await postService.createNewPost(serviceParamDto);

      verify(postRepository.createPost(anything())).once();
      const [createPostRepoParamDto] = capture<CreatePostRepoParamDto>(postRepository.createPost).last();
      renderedHtml = createPostRepoParamDto.renderedContent;
    });
  });
});
