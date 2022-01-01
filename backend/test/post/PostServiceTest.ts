import { should } from 'chai';
import { anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import fs from 'fs';
import { File } from 'formidable';
import PostService from '@src/post/PostService';
import PostMetaRepository from '@src/post/repository/PostMetaRepository';
import PostVersionRepository from '@src/post/repository/PostVersionRepository';
import CategoryRepository from '@src/category/CategoryRepository';
import SeriesRepository from '@src/series/SeriesRepository';
import TagRepository from '@src/tag/TagRepository';
import * as MarkedContentRenderingUtil from '@src/common/marked/MarkedContentRenderingUtil';
import {
  CreatePostVersionRepoParamDto,
  DeletePostVersionRepoParamDto,
  FindPostVersionRepoParamDto,
} from '@src/post/dto/PostVersionRepoParamDto';
import {
  AddUpdatedVersionPostParamDto,
  CreateNewPostParamDto,
  DeletePostParamDto,
  DeletePostVersionParamDto,
  FindPostParamDto,
  UpdatePostMetaDataParamDto,
} from '@src/post/dto/PostParamDto';
import { appPath, common as commonTestData } from '@test/data/testData';
import {
  CreatePostMetaRepoParamDto,
  DeletePostMetaRepoParamDto,
  FindPostMetaRepoParamDto,
  UpdatePostMetaRepoParamDto,
} from '@src/post/dto/PostMetaRepoParamDto';
import { CategoryDoc } from '@src/category/Category';
import { SeriesDoc } from '@src/series/Series';
import { TagDoc } from '@src/tag/Tag';
import {
  abortTestTransaction,
  errorShouldBeThrown,
  extractFileInfoFromRawFile,
  replaceUseTransactionForTest,
} from '@test/TestUtil';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import Language from '@src/common/constant/Language';
import { PostMetaDoc } from '@src/post/model/PostMeta';
import { FindPostResponseDto } from '@src/post/dto/PostResponseDto';
import { PostVersionDoc } from '@src/post/model/PostVersion';
import sinon from 'sinon';
import { ClientSession, Connection } from 'mongoose';
import { createMongoMemoryReplSet, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('PostService test', () => {
  let sandbox;
  let replSet: MongoMemoryReplSet;
  let conn: Connection;
  let session: ClientSession;
  let postService: PostService;
  let postMetaRepository: PostMetaRepository;
  let postVersionRepository: PostVersionRepository;
  let categoryRepository: CategoryRepository;
  let seriesRepository: SeriesRepository;
  let tagRepository: TagRepository;

  before(async () => {
    should();
    replSet = await createMongoMemoryReplSet();
    conn = setConnection(replSet.getUri());
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    postMetaRepository = spy(mock(PostMetaRepository));
    postVersionRepository = spy(mock(PostVersionRepository));
    categoryRepository = mock(CategoryRepository);
    seriesRepository = mock(SeriesRepository);
    tagRepository = mock(TagRepository);
    postService = new PostService(
      instance(postMetaRepository),
      instance(postVersionRepository),
      instance(categoryRepository),
      instance(seriesRepository),
      instance(tagRepository),
    );
    session = await conn.startSession();
    session.startTransaction();
    await replaceUseTransactionForTest(sandbox, session);
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
    await replSet.stop();
  });

  describe('findPost test', () => {
    let postMeta1: PostMetaDoc;
    let postMeta2: PostMetaDoc;
    let postMeta3: PostMetaDoc;
    let post1: PostVersionDoc;
    let post2V1: PostVersionDoc;
    let post2V2: PostVersionDoc;
    let post3: PostVersionDoc;

    before(() => {
      postMeta1 = {
        postNo: commonTestData.post1V1.postNo,
        category: commonTestData.category1.name,
        series: commonTestData.series1.name,
        tagList: [commonTestData.tag1.name, commonTestData.tag2.name],
        createdDate: commonTestData.dateList[0],
        isDeleted: false,
        commentCount: 0,
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
      } as PostMetaDoc;
      postMeta2 = {
        postNo: commonTestData.post2V1.postNo,
        category: commonTestData.category2.name,
        series: commonTestData.series2.name,
        tagList: [commonTestData.tag2.name, commonTestData.tag2.name],
        createdDate: commonTestData.dateList[1],
        isDeleted: false,
        commentCount: 0,
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
      } as PostMetaDoc;
      postMeta3 = {
        postNo: commonTestData.post3.postNo,
        category: commonTestData.category3.name,
        series: commonTestData.series3.name,
        tagList: [commonTestData.tag3.name, commonTestData.tag3.name],
        createdDate: commonTestData.dateList[2],
        isDeleted: false,
        commentCount: 0,
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
      } as PostMetaDoc;
      post1 = {
        postNo: commonTestData.post1V1.postNo,
        title: commonTestData.post1V1.title,
        rawContent: commonTestData.post1V1.rawContent,
        renderedContent: commonTestData.post1V1.renderedContent,
        toc: commonTestData.post1V1.toc,
        language: commonTestData.post1V1.language,
        thumbnailContent: commonTestData.post1V1.thumbnailContent,
        thumbnailImage: commonTestData.objectIdList[0],
        updatedDate: commonTestData.dateList[3],
        isLatestVersion: commonTestData.post1V1.isLatestVersion,
      } as PostVersionDoc;
      post2V1 = {
        postNo: commonTestData.post2V1.postNo,
        title: commonTestData.post2V1.title,
        rawContent: commonTestData.post2V1.rawContent,
        renderedContent: commonTestData.post2V1.renderedContent,
        toc: commonTestData.post2V1.toc,
        language: commonTestData.post2V1.language,
        thumbnailContent: commonTestData.post2V1.thumbnailContent,
        thumbnailImage: commonTestData.objectIdList[1],
        updatedDate: commonTestData.dateList[4],
        isLatestVersion: commonTestData.post2V1.isLatestVersion,
      } as PostVersionDoc;
      post2V2 = {
        postNo: commonTestData.post2V2.postNo,
        title: commonTestData.post2V2.title,
        rawContent: commonTestData.post2V2.rawContent,
        renderedContent: commonTestData.post2V2.renderedContent,
        toc: commonTestData.post2V2.toc,
        language: commonTestData.post2V2.language,
        thumbnailContent: commonTestData.post2V2.thumbnailContent,
        thumbnailImage: commonTestData.objectIdList[1],
        updatedDate: commonTestData.dateList[4],
        isLatestVersion: commonTestData.post2V2.isLatestVersion,
        lastPostVersion: commonTestData.objectIdList[0],
      } as PostVersionDoc;
      post3 = {
        postNo: commonTestData.post3.postNo,
        title: commonTestData.post3.title,
        rawContent: commonTestData.post3.rawContent,
        renderedContent: commonTestData.post3.renderedContent,
        toc: commonTestData.post3.toc,
        language: commonTestData.post3.language,
        thumbnailContent: commonTestData.post3.thumbnailContent,
        thumbnailImage: commonTestData.objectIdList[1],
        updatedDate: commonTestData.dateList[4],
        isLatestVersion: commonTestData.post3.isLatestVersion,
      } as PostVersionDoc;
    });

    it('findPost test - empty parameter, full response', async () => {
      const paramDto: FindPostParamDto = {};

      when(postMetaRepository.findPostMeta(anything(), anything()))
        .thenResolve([postMeta3, postMeta2, postMeta1]);
      when(postVersionRepository.findPostVersion(anything(), anything()))
        .thenResolve([post3, post2V2, post2V1, post1]);

      const responseDto: FindPostResponseDto = await postService.findPost(paramDto);
      responseDto.postList.length.should.equal(3);
      responseDto.postList[0].postNo.should.equal(postMeta3.postNo);
      responseDto.postList[0].category.should.equal(postMeta3.category);
      responseDto.postList[0].series.should.equal(postMeta3.series);
      responseDto.postList[0].tagList.should.deep.equal(postMeta3.tagList);
      responseDto.postList[0].createdDate.should.equal(postMeta3.createdDate);
      responseDto.postList[0].isDeleted.should.equal(postMeta3.isDeleted);
      responseDto.postList[0].commentCount.should.equal(postMeta3.commentCount);
      responseDto.postList[0].isPrivate.should.equal(postMeta3.isPrivate);
      responseDto.postList[0].isDeprecated.should.equal(postMeta3.isDeprecated);
      responseDto.postList[0].isDraft.should.equal(postMeta3.isDraft);
      responseDto.postList[0].postVersionList.length.should.equal(1);
      responseDto.postList[0].postVersionList[0].title.should.equal(post3.title);
      responseDto.postList[0].postVersionList[0].rawContent.should.equal(post3.rawContent);
      responseDto.postList[0].postVersionList[0].renderedContent.should.equal(post3.renderedContent);
      responseDto.postList[0].postVersionList[0].toc.should.deep.equal(post3.toc);
      responseDto.postList[0].postVersionList[0].language.should.equal(post3.language);
      responseDto.postList[0].postVersionList[0].thumbnailContent.should.equal(post3.thumbnailContent);
      responseDto.postList[0].postVersionList[0].thumbnailImage.should.equal(post3.thumbnailImage);
      responseDto.postList[0].postVersionList[0].updatedDate.should.equal(post3.updatedDate);
      responseDto.postList[0].postVersionList[0].isLatestVersion.should.equal(post3.isLatestVersion);
      (responseDto.postList[0].postVersionList[0].lastPostVersion === undefined).should.be.true;
      responseDto.postList[1].postNo.should.equal(postMeta2.postNo);
      responseDto.postList[1].category.should.equal(postMeta2.category);
      responseDto.postList[1].series.should.equal(postMeta2.series);
      responseDto.postList[1].tagList.should.deep.equal(postMeta2.tagList);
      responseDto.postList[1].createdDate.should.equal(postMeta2.createdDate);
      responseDto.postList[1].isDeleted.should.equal(postMeta2.isDeleted);
      responseDto.postList[1].commentCount.should.equal(postMeta2.commentCount);
      responseDto.postList[1].isPrivate.should.equal(postMeta2.isPrivate);
      responseDto.postList[1].isDeprecated.should.equal(postMeta2.isDeprecated);
      responseDto.postList[1].isDraft.should.equal(postMeta2.isDraft);
      responseDto.postList[1].postVersionList.length.should.equal(2);
      responseDto.postList[1].postVersionList[0].title.should.equal(post2V2.title);
      responseDto.postList[1].postVersionList[0].rawContent.should.equal(post2V2.rawContent);
      responseDto.postList[1].postVersionList[0].renderedContent.should.equal(post2V2.renderedContent);
      responseDto.postList[1].postVersionList[0].toc.should.deep.equal(post2V2.toc);
      responseDto.postList[1].postVersionList[0].language.should.equal(post2V2.language);
      responseDto.postList[1].postVersionList[0].thumbnailContent.should.equal(post2V2.thumbnailContent);
      responseDto.postList[1].postVersionList[0].thumbnailImage.should.equal(post2V2.thumbnailImage);
      responseDto.postList[1].postVersionList[0].updatedDate.should.equal(post2V2.updatedDate);
      responseDto.postList[1].postVersionList[0].isLatestVersion.should.equal(post2V2.isLatestVersion);
      responseDto.postList[1].postVersionList[0].lastPostVersion.should.equal(post2V2.lastPostVersion);
      responseDto.postList[1].postVersionList[1].title.should.equal(post2V1.title);
      responseDto.postList[1].postVersionList[1].rawContent.should.equal(post2V1.rawContent);
      responseDto.postList[1].postVersionList[1].renderedContent.should.equal(post2V1.renderedContent);
      responseDto.postList[1].postVersionList[1].toc.should.deep.equal(post2V1.toc);
      responseDto.postList[1].postVersionList[1].language.should.equal(post2V1.language);
      responseDto.postList[1].postVersionList[1].thumbnailContent.should.equal(post2V1.thumbnailContent);
      responseDto.postList[1].postVersionList[1].thumbnailImage.should.equal(post2V1.thumbnailImage);
      responseDto.postList[1].postVersionList[1].updatedDate.should.equal(post2V1.updatedDate);
      responseDto.postList[1].postVersionList[1].isLatestVersion.should.equal(post2V1.isLatestVersion);
      (responseDto.postList[1].postVersionList[1].lastPostVersion === undefined).should.be.true;
      responseDto.postList[2].postNo.should.equal(postMeta1.postNo);
      responseDto.postList[2].category.should.equal(postMeta1.category);
      responseDto.postList[2].series.should.equal(postMeta1.series);
      responseDto.postList[2].tagList.should.deep.equal(postMeta1.tagList);
      responseDto.postList[2].createdDate.should.equal(postMeta1.createdDate);
      responseDto.postList[2].isDeleted.should.equal(postMeta1.isDeleted);
      responseDto.postList[2].commentCount.should.equal(postMeta1.commentCount);
      responseDto.postList[2].isPrivate.should.equal(postMeta1.isPrivate);
      responseDto.postList[2].isDeprecated.should.equal(postMeta1.isDeprecated);
      responseDto.postList[2].isDraft.should.equal(postMeta1.isDraft);
      responseDto.postList[2].postVersionList.length.should.equal(1);
      responseDto.postList[2].postVersionList[0].title.should.equal(post1.title);
      responseDto.postList[2].postVersionList[0].rawContent.should.equal(post1.rawContent);
      responseDto.postList[2].postVersionList[0].renderedContent.should.equal(post1.renderedContent);
      responseDto.postList[2].postVersionList[0].toc.should.deep.equal(post1.toc);
      responseDto.postList[2].postVersionList[0].language.should.equal(post1.language);
      responseDto.postList[2].postVersionList[0].thumbnailContent.should.equal(post1.thumbnailContent);
      responseDto.postList[2].postVersionList[0].thumbnailImage.should.equal(post1.thumbnailImage);
      responseDto.postList[2].postVersionList[0].updatedDate.should.equal(post1.updatedDate);
      responseDto.postList[2].postVersionList[0].isLatestVersion.should.equal(post1.isLatestVersion);
      (responseDto.postList[2].postVersionList[0].lastPostVersion === undefined).should.be.true;

      verify(postMetaRepository.findPostMeta(anything(), anything())).once();
      const [findPostMetaRepoParamDto] = capture<FindPostMetaRepoParamDto, ClientSession>(postMetaRepository.findPostMeta).first();
      findPostMetaRepoParamDto.should.be.empty;

      verify(postVersionRepository.findPostVersion(anything(), anything())).once();
      const [findPostVersionRepoParamDto] = capture<FindPostVersionRepoParamDto, ClientSession>(postVersionRepository.findPostVersion).first();
      findPostVersionRepoParamDto.should.be.empty;
    });

    it('findPost test - full parameter, empty response', async () => {
      const paramDto: FindPostParamDto = {
        postNo: commonTestData.post1V1.postNo,
        categoryId: commonTestData.objectIdList[0],
        seriesId: commonTestData.objectIdList[1],
        tagIdList: [commonTestData.objectIdList[2], commonTestData.objectIdList[3]],
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
        postVersionId: commonTestData.objectIdList[4],
        title: commonTestData.post1V1.title,
        rawContent: commonTestData.post1V1.rawContent,
        renderedContent: commonTestData.post1V1.renderedContent,
        language: commonTestData.post1V1.language,
        thumbnailContent: commonTestData.post1V1.thumbnailContent,
        thumbnailImageId: commonTestData.objectIdList[5],
        updateDateFrom: commonTestData.dateList[0],
        updateDateTo: commonTestData.dateList[1],
        isLatestVersion: commonTestData.post1V1.isLatestVersion,
        isOnlyExactSameFieldFound: true,
      };

      when(postMetaRepository.findPostMeta(anything(), anything()))
        .thenResolve([]);
      when(postVersionRepository.findPostVersion(anything(), anything()))
        .thenResolve([]);

      const responseDto: FindPostResponseDto = await postService.findPost(paramDto);
      responseDto.postList.should.be.empty;

      verify(postMetaRepository.findPostMeta(anything(), anything())).once();
      const [findPostMetaRepoParamDto] = capture<FindPostMetaRepoParamDto, ClientSession>(postMetaRepository.findPostMeta).first();
      findPostMetaRepoParamDto.postNo!.should.equal(commonTestData.post1V1.postNo);
      findPostMetaRepoParamDto.categoryId!.should.equal(commonTestData.objectIdList[0]);
      findPostMetaRepoParamDto.seriesId!.should.equal(commonTestData.objectIdList[1]);
      findPostMetaRepoParamDto.tagIdList!.should.deep.equal([commonTestData.objectIdList[2], commonTestData.objectIdList[3]]);
      findPostMetaRepoParamDto.isPrivate!.should.equal(false);
      findPostMetaRepoParamDto.isDeprecated!.should.equal(false);
      findPostMetaRepoParamDto.isDraft!.should.equal(false);

      verify(postVersionRepository.findPostVersion(anything(), anything())).once();
      const [findPostVersionRepoParamDto] = capture<FindPostVersionRepoParamDto, ClientSession>(postVersionRepository.findPostVersion).first();
      findPostVersionRepoParamDto.postNo!.should.equal(commonTestData.post1V1.postNo);
      findPostVersionRepoParamDto.postVersionId!.should.equal(commonTestData.objectIdList[4]);
      findPostVersionRepoParamDto.title!.should.equal(commonTestData.post1V1.title);
      findPostVersionRepoParamDto.rawContent!.should.equal(commonTestData.post1V1.rawContent);
      findPostVersionRepoParamDto.renderedContent!.should.equal(commonTestData.post1V1.renderedContent);
      findPostVersionRepoParamDto.language!.should.equal(commonTestData.post1V1.language);
      findPostVersionRepoParamDto.thumbnailContent!.should.equal(commonTestData.post1V1.thumbnailContent);
      findPostVersionRepoParamDto.thumbnailImageId!.should.equal(commonTestData.objectIdList[5]);
      findPostVersionRepoParamDto.findPostVersionByUpdatedDateDto!.from!.should.equal(commonTestData.dateList[0]);
      findPostVersionRepoParamDto.findPostVersionByUpdatedDateDto!.to!.should.equal(commonTestData.dateList[1]);
      findPostVersionRepoParamDto.isLatestVersion!.should.equal(commonTestData.post1V1.isLatestVersion);
      findPostVersionRepoParamDto.isOnlyExactSameFieldFound!.should.equal(true);
    });
  });

  describe('createNewPost test', () => {
    let gifImageId: string;
    let file: File;
    let fileContent: string;

    beforeEach(async () => {
      [gifImageId] = commonTestData.objectIdList;
      ({ file, fileContent } = extractFileInfoFromRawFile('gfm+.md'));
    });

    it('createNewPost test - without optional parameters', async () => {
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        language: Language.KO,
      };

      when(postMetaRepository.createPostMeta(anything(), anything()))
        .thenResolve(commonTestData.post1V1.postNo);
      sandbox.stub(MarkedContentRenderingUtil, 'renderContent')
        .returns({
          renderedContent: commonTestData.simpleTexts[0],
          toc: [{ depth: 0, text: commonTestData.simpleTexts[1] }],
          defaultThumbnailContent: commonTestData.simpleTexts[2],
        });

      const date1 = new Date();
      await postService.createNewPost(serviceParamDto);
      const date2 = new Date();

      verify(postMetaRepository.createPostMeta(anything(), anything())).once();
      const [createPostMetaRepoParamDto] = capture<CreatePostMetaRepoParamDto, ClientSession>(postMetaRepository.createPostMeta).first();
      (createPostMetaRepoParamDto.categoryId === undefined).should.be.true;
      (createPostMetaRepoParamDto.seriesId === undefined).should.be.true;
      (createPostMetaRepoParamDto.tagIdList === undefined).should.be.true;
      createPostMetaRepoParamDto.createdDate.should.within(date1, date2);
      createPostMetaRepoParamDto.isPrivate!.should.be.false;

      verify(postVersionRepository.createPostVersion(anything(), anything())).once();
      const [createPostVersionRepoParamDto] = capture<CreatePostVersionRepoParamDto, ClientSession>(postVersionRepository.createPostVersion).last();
      createPostVersionRepoParamDto.postNo.should.equal(1);
      createPostVersionRepoParamDto.title.should.equal(file.name);
      createPostVersionRepoParamDto.rawContent.should.equal(fileContent);
      createPostVersionRepoParamDto.renderedContent.should.equal(commonTestData.simpleTexts[0]);
      createPostVersionRepoParamDto.renderedContent.should.not.equal(fileContent);
      createPostVersionRepoParamDto.toc.length.should.equal(1);
      createPostVersionRepoParamDto.toc[0].depth.should.equal(0);
      createPostVersionRepoParamDto.toc[0].text.should.equal(commonTestData.simpleTexts[1]);
      createPostVersionRepoParamDto.language.should.equal(commonTestData.post1V1.language);
      createPostVersionRepoParamDto.thumbnailContent.should.equal(commonTestData.simpleTexts[2]);
      (createPostVersionRepoParamDto.thumbnailImageId === undefined).should.be.true;
      createPostVersionRepoParamDto.isLatestVersion.should.be.true;
      (createPostVersionRepoParamDto.lastPostVersion === undefined).should.be.true;
      createPostVersionRepoParamDto.updatedDate!.should.within(date1, date2);
    });

    it('createNewPost test - with full parameters', async () => {
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        thumbnailImageId: gifImageId,
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
        isPrivate: true,
        isDraft: true,
      };
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[0] } as CategoryDoc]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[1] } as SeriesDoc]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      }), session))
        .thenResolve([
          { _id: commonTestData.objectIdList[2], name: commonTestData.tag1.name } as TagDoc,
          { _id: commonTestData.objectIdList[3], name: commonTestData.tag2.name } as TagDoc,
        ]);
      when(postMetaRepository.createPostMeta(anything(), session))
        .thenResolve(commonTestData.post1V1.postNo);

      const date1 = new Date();
      const result = await postService.createNewPost(serviceParamDto);
      const date2 = new Date();

      verify(postMetaRepository.createPostMeta(anything(), session)).once();
      const [createPostMetaRepoParamDto] = capture<CreatePostMetaRepoParamDto, ClientSession>(postMetaRepository.createPostMeta).first();
      createPostMetaRepoParamDto.categoryId!.should.equal(commonTestData.objectIdList[0]);
      createPostMetaRepoParamDto.seriesId!.should.equal(commonTestData.objectIdList[1]);
      createPostMetaRepoParamDto.tagIdList!.should.deep.equal([commonTestData.objectIdList[2], commonTestData.objectIdList[3]]);
      createPostMetaRepoParamDto.createdDate.should.within(date1, date2);
      createPostMetaRepoParamDto.isPrivate!.should.be.true;
      createPostMetaRepoParamDto.isDraft!.should.be.true;

      verify(postVersionRepository.createPostVersion(anything(), session)).once();
      const [createPostVersionRepoParamDto] = capture<CreatePostVersionRepoParamDto, ClientSession>(postVersionRepository.createPostVersion).last();
      createPostVersionRepoParamDto.postNo.should.equal(1);
      createPostVersionRepoParamDto.title.should.equal(file.name);
      createPostVersionRepoParamDto.rawContent.should.equal(fileContent);
      createPostVersionRepoParamDto.renderedContent.should.not.be.empty;
      createPostVersionRepoParamDto.renderedContent.should.not.equal(fileContent);
      createPostVersionRepoParamDto.language.should.equal(commonTestData.post1V1.language);
      createPostVersionRepoParamDto.thumbnailContent.should.equal(commonTestData.simpleTexts[0]);
      createPostVersionRepoParamDto.thumbnailImageId!.toString().should.equal(gifImageId);
      createPostVersionRepoParamDto.isLatestVersion.should.be.true;
      (createPostVersionRepoParamDto.lastPostVersion === undefined).should.be.true;
      createPostVersionRepoParamDto.updatedDate!.should.within(date1, date2);

      result.should.equal(commonTestData.post1V1.postNo);
    });

    it('createNewPost test - with inexistent categoryName', async () => {
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
      };
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name }), session))
        .thenResolve([]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[1] } as SeriesDoc]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      }), session))
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
        ...commonTestData.post1V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
      };
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[0] } as CategoryDoc]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name }), session))
        .thenResolve([]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      }), session))
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
        ...commonTestData.post1V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
      };
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[0] } as CategoryDoc]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[1] } as SeriesDoc]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      }), session))
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
      if (!fs.existsSync(appPath.renderedHtml)) {
        fs.mkdirSync(appPath.renderedHtml, { recursive: true });
      }
      fs.writeFileSync(
        `${appPath.renderedHtml}/md.css`,
        'table {border-collapse: collapse; width: 100%;} td,th {border: 1px solid black;}',
      );
    });

    afterEach(() => {
      if (!fs.existsSync(appPath.renderedHtml)) {
        fs.mkdirSync(appPath.renderedHtml, { recursive: true });
      }
      fs.writeFileSync(
        `${appPath.renderedHtml}/${fileName}.html`,
        `<html><head lang="ko"><meta charset="UTF-8"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.min.css" integrity="sha384-RZU/ijkSsFbcmivfdRBQDtwuwVqK7GMOw6IMvKyeWL2K5UAlyp6WonmB8m7Jd0Hn" crossorigin="anonymous"><link rel="stylesheet" type="text/css" href="md.css"/><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.1.0/styles/monokai.min.css"></head><body>${renderedHtml}</body></html>`, // eslint-disable-line
      );
    });

    it('content rendering test - GFM + alpha', async () => {
      fileName = 'gfm+';
      const { file } = extractFileInfoFromRawFile(`${fileName}.md`);
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1V1,
      };
      when(postMetaRepository.createPostMeta(anything(), session))
        .thenResolve(commonTestData.post1V1.postNo);

      await postService.createNewPost(serviceParamDto);

      verify(postVersionRepository.createPostVersion(anything(), session)).once();
      const [createPostVersionRepoParamDto] = capture<CreatePostVersionRepoParamDto, ClientSession>(postVersionRepository.createPostVersion).last();
      createPostVersionRepoParamDto.toc.should.deep.equal([
        { depth: 2, text: 'ul/li' },
        { depth: 3, text: 'only plain text' },
        { depth: 3, text: 'with other elements' },
        { depth: 2, text: '테이블' },
        { depth: 3, text: 'list indentation 없음 / 2 x 3' },
        { depth: 3, text: 'list indentation 1단계 (2 spaces) / 2 x 3' },
        { depth: 2, text: '강조문법' },
        { depth: 3, text: 'bold' },
        { depth: 3, text: 'italic' },
        { depth: 3, text: 'bold and italic' },
        { depth: 3, text: 'strike-out' },
        { depth: 3, text: 'should be excluded in code blocks' },
        { depth: 3, text: 'should be excluded in inline code' },
        { depth: 2, text: 'Raw HTML' },
        { depth: 3, text: 'list indentation 없음' },
        { depth: 3, text: 'list indentation 1단계 (2 spaces)' },
        { depth: 2, text: 'New Lines' },
        { depth: 3, text: 'single new line between normal lines' },
        { depth: 3, text: 'two new lines between normal lines' },
        { depth: 3, text: 'three new lines between normal lines' },
      ]);
      createPostVersionRepoParamDto.thumbnailContent.length.should.be.greaterThan(0);
      createPostVersionRepoParamDto.thumbnailContent.length.should.be.lessThanOrEqual(303);
    });

    it('content rendering test - code blocks', async () => {
      fileName = 'code';
      const { file } = extractFileInfoFromRawFile(`${fileName}.md`);
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1V1,
      };
      when(postMetaRepository.createPostMeta(anything(), session))
        .thenResolve(commonTestData.post1V1.postNo);

      await postService.createNewPost(serviceParamDto);

      verify(postVersionRepository.createPostVersion(anything(), session)).once();
      const [createPostVersionRepoParamDto] = capture<CreatePostVersionRepoParamDto, ClientSession>(postVersionRepository.createPostVersion).last();
      createPostVersionRepoParamDto.toc.should.deep.equal([
        { depth: 2, text: '코드' },
        { depth: 3, text: 'list indentation 없음' },
        { depth: 3, text: 'list indentation 1단계 (tab)' },
        { depth: 3, text: 'list indentation 1단계 (2 spaces)' },
        { depth: 3, text: 'list indentation 1단계 (4 spaces)' },
        { depth: 3, text: 'list indentation 2단계 (tab)' },
        { depth: 3, text: 'list indentation 2단계 (2 spaces)' },
        { depth: 3, text: 'list indentation 2단계 (4 spaces)' },
        { depth: 3, text: 'list indentation 2단계 (tab & 2 spaces mixed)' },
        { depth: 3, text: 'inline code' },
      ]);
      createPostVersionRepoParamDto.thumbnailContent.length.should.be.greaterThan(0);
      createPostVersionRepoParamDto.thumbnailContent.length.should.be.lessThanOrEqual(303);
    });

    it('content rendering test - mathematical expressions', async () => {
      fileName = 'math';
      const { file } = extractFileInfoFromRawFile(`${fileName}.md`);
      const serviceParamDto: CreateNewPostParamDto = {
        post: file,
        ...commonTestData.post1V1,
      };
      when(postMetaRepository.createPostMeta(anything(), session))
        .thenResolve(commonTestData.post1V1.postNo);

      await postService.createNewPost(serviceParamDto);

      verify(postVersionRepository.createPostVersion(anything(), session)).once();
      const [createPostVersionRepoParamDto] = capture<CreatePostVersionRepoParamDto, ClientSession>(postVersionRepository.createPostVersion).last();
      renderedHtml = createPostVersionRepoParamDto.renderedContent;
      createPostVersionRepoParamDto.toc.should.deep.equal([
        { depth: 2, text: '수식 (block)' },
        { depth: 3, text: '간단한 수식' },
        { depth: 3, text: 'list indentation 없음' },
        { depth: 3, text: 'list indentation 1단계 (tab)' },
        { depth: 3, text: 'list indentation 1단계 (2 spaces)' },
        { depth: 3, text: 'list indentation 1단계 (4 spaces)' },
        { depth: 3, text: 'list indentation 2단계 (tab)' },
        { depth: 3, text: 'list indentation 2단계 (2 spaces)' },
        { depth: 3, text: 'list indentation 2단계 (4 spaces)' },
        { depth: 2, text: '수식 (inline)' },
        { depth: 3, text: 'list indentation 없음' },
        { depth: 3, text: 'list indentation 1단계 (tab)' },
        { depth: 3, text: 'list indentation 1단계 (2 spaces)' },
        { depth: 3, text: 'list indentation 1단계 (4 spaces)' },
        { depth: 3, text: 'list indentation 2단계 (tab)' },
        { depth: 3, text: 'list indentation 2단계 (2 spaces)' },
        { depth: 3, text: 'list indentation 2단계 (4 spaces)' },
      ]);
      createPostVersionRepoParamDto.thumbnailContent.length.should.be.greaterThan(0);
      createPostVersionRepoParamDto.thumbnailContent.length.should.be.lessThanOrEqual(303);
    });
  });

  describe('addUpdatedVersionPost test', () => {
    let gifImageId: string;
    let file: File;
    let fileContent: string;

    beforeEach(async () => {
      [gifImageId] = commonTestData.objectIdList;
      ({ file, fileContent } = extractFileInfoFromRawFile('gfm+.md'));
    });

    it('addUpdatedVersionPost test - thumbnailContent: O, thumbnailImage: O', async () => {
      const paramDto: AddUpdatedVersionPostParamDto = {
        postNo: commonTestData.post2V1.postNo,
        post: file,
        language: Language.KO,
        thumbnailContent: commonTestData.simpleTexts[0],
        thumbnailImageId: gifImageId,
      };
      when(postVersionRepository.createPostVersion(anything(), session))
        .thenResolve(commonTestData.objectIdList[1]);

      const date1 = new Date();
      const result = await postService.addUpdatedVersionPost(paramDto);
      const date2 = new Date();

      result.should.equal(commonTestData.objectIdList[1]);
      verify(postVersionRepository.createPostVersion(anything(), session)).once();
      const [createPostVersionRepoParamDto] = capture<CreatePostVersionRepoParamDto, ClientSession>(postVersionRepository.createPostVersion).first();
      createPostVersionRepoParamDto.postNo.should.equal(commonTestData.post2V1.postNo);
      createPostVersionRepoParamDto.title.should.equal(file.name);
      createPostVersionRepoParamDto.rawContent.should.equal(fileContent);
      createPostVersionRepoParamDto.renderedContent.should.not.be.empty;
      createPostVersionRepoParamDto.renderedContent.should.not.equal(fileContent);
      createPostVersionRepoParamDto.language.should.equal(commonTestData.post1V1.language);
      createPostVersionRepoParamDto.thumbnailContent.should.equal(commonTestData.simpleTexts[0]);
      (createPostVersionRepoParamDto.thumbnailImageId!.toString() === gifImageId).should.be.true;
      createPostVersionRepoParamDto.isLatestVersion.should.be.true;
      (createPostVersionRepoParamDto.lastPostVersion === undefined).should.be.true;
      createPostVersionRepoParamDto.updatedDate!.should.within(date1, date2);
    });

    it('addUpdatedVersionPost test - thumbnailContent: X, thumbnailImage: X', async () => {
      const paramDto: AddUpdatedVersionPostParamDto = {
        postNo: commonTestData.post2V1.postNo,
        post: file,
        language: Language.KO,
      };
      when(postVersionRepository.createPostVersion(anything(), session))
        .thenResolve(commonTestData.objectIdList[1]);

      const date1 = new Date();
      const result = await postService.addUpdatedVersionPost(paramDto);
      const date2 = new Date();

      result.should.equal(commonTestData.objectIdList[1]);
      verify(postVersionRepository.createPostVersion(anything(), session)).once();
      const [createPostVersionRepoParamDto] = capture<CreatePostVersionRepoParamDto, ClientSession>(postVersionRepository.createPostVersion).first();
      createPostVersionRepoParamDto.postNo.should.equal(commonTestData.post2V1.postNo);
      createPostVersionRepoParamDto.title.should.equal(file.name);
      createPostVersionRepoParamDto.rawContent.should.equal(fileContent);
      createPostVersionRepoParamDto.renderedContent.should.not.be.empty;
      createPostVersionRepoParamDto.renderedContent.should.not.equal(fileContent);
      createPostVersionRepoParamDto.language.should.equal(commonTestData.post1V1.language);
      createPostVersionRepoParamDto.thumbnailContent.should.not.be.empty;
      (createPostVersionRepoParamDto.thumbnailImageId === undefined).should.be.true;
      createPostVersionRepoParamDto.isLatestVersion.should.be.true;
      (createPostVersionRepoParamDto.lastPostVersion === undefined).should.be.true;
      createPostVersionRepoParamDto.updatedDate!.should.within(date1, date2);
    });
  });

  describe('updatePostMetaData test', () => {
    it('updatePostMetaData - with full parameter', async () => {
      const paramDto: UpdatePostMetaDataParamDto = {
        postNo: commonTestData.post1V1.postNo,
        categoryName: commonTestData.category1.name,
        seriesName: commonTestData.series1.name,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
        isPrivate: true,
        isDeprecated: true,
        isDraft: true,
      };

      when(postMetaRepository.findPostMeta(deepEqual({ postNo: commonTestData.post1V1.postNo }), session))
        .thenResolve([{
          isPrivate: false,
          isDeprecated: false,
          isDraft: false,
        } as PostMetaDoc]);
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[0] } as CategoryDoc]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[1] } as SeriesDoc]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name],
          isOnlyExactNameFound: true,
        },
      }), session))
        .thenResolve([
          { _id: commonTestData.objectIdList[2], name: commonTestData.tag1.name } as TagDoc,
          { _id: commonTestData.objectIdList[3], name: commonTestData.tag2.name } as TagDoc,
        ]);

      await postService.updatePostMetaData(paramDto);
      verify(postMetaRepository.updatePostMeta(anything(), session)).once();
      const [updatePostMetaRepoParamDto] = capture<UpdatePostMetaRepoParamDto, ClientSession>(postMetaRepository.updatePostMeta).first();
      updatePostMetaRepoParamDto.categoryId!.should.equal(commonTestData.objectIdList[0]);
      updatePostMetaRepoParamDto.seriesId!.should.equal(commonTestData.objectIdList[1]);
      updatePostMetaRepoParamDto.tagIdList!.should.deep.equal([commonTestData.objectIdList[2], commonTestData.objectIdList[3]]);
      updatePostMetaRepoParamDto.isPrivate!.should.be.true;
      updatePostMetaRepoParamDto.isDeprecated!.should.be.true;
      updatePostMetaRepoParamDto.isDraft!.should.be.true;
    });

    it('updatePostMetaData - with inexistent postNo', async () => {
      const paramDto: UpdatePostMetaDataParamDto = {
        postNo: commonTestData.post1V1.postNo,
      };

      when(postMetaRepository.findPostMeta(deepEqual({ postNo: commonTestData.post1V1.postNo }), session))
        .thenResolve([]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.POST_NOT_FOUND, [commonTestData.post1V1.postNo.toString(), 'postNo']),
        (_param) => postService.updatePostMetaData(_param),
        paramDto,
      );
    });

    it('updatePostMetaData - with inexistent categoryName', async () => {
      const paramDto: UpdatePostMetaDataParamDto = {
        postNo: commonTestData.post1V1.postNo,
        categoryName: commonTestData.category1.name,
      };

      when(postMetaRepository.findPostMeta(deepEqual({ postNo: commonTestData.post1V1.postNo }), session))
        .thenResolve([{
          isPrivate: false,
          isDeprecated: false,
          isDraft: false,
        } as PostMetaDoc]);
      when(categoryRepository.findCategory(deepEqual({ name: commonTestData.category1.name }), session))
        .thenResolve([]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [commonTestData.category1.name, 'name']),
        (_param) => postService.updatePostMetaData(_param),
        paramDto,
      );
    });

    it('updatePostMetaData - with inexistent seriesName', async () => {
      const paramDto: UpdatePostMetaDataParamDto = {
        postNo: commonTestData.post1V1.postNo,
        seriesName: commonTestData.series1.name,
      };

      when(postMetaRepository.findPostMeta(deepEqual({ postNo: commonTestData.post1V1.postNo }), session))
        .thenResolve([{
          isPrivate: false,
          isDeprecated: false,
          isDraft: false,
        } as PostMetaDoc]);
      when(seriesRepository.findSeries(deepEqual({ name: commonTestData.series1.name }), session))
        .thenResolve([]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.SERIES_NOT_FOUND, [commonTestData.series1.name, 'name']),
        (_param) => postService.updatePostMetaData(_param),
        paramDto,
      );
    });

    it('updatePostMetaData - with inexistent tagNames', async () => {
      const paramDto: UpdatePostMetaDataParamDto = {
        postNo: commonTestData.post1V1.postNo,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name, commonTestData.tag3.name],
      };

      when(postMetaRepository.findPostMeta(deepEqual({ postNo: commonTestData.post1V1.postNo }), session))
        .thenResolve([{
          isPrivate: false,
          isDeprecated: false,
          isDraft: false,
        } as PostMetaDoc]);
      when(tagRepository.findTag(deepEqual({
        findTagByNameDto: {
          nameList: [commonTestData.tag1.name, commonTestData.tag2.name, commonTestData.tag3.name],
          isOnlyExactNameFound: true,
        },
      }), session))
        .thenResolve([{ _id: commonTestData.objectIdList[0], name: commonTestData.tag3.name } as TagDoc]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.TAGS_NOT_FOUND, ['name', `${commonTestData.tag1.name}, ${commonTestData.tag2.name}`]),
        (_param) => postService.updatePostMetaData(_param),
        paramDto,
      );
    });

    it('updatePostMetaData - with empty parameter', async () => {
      const paramDto: UpdatePostMetaDataParamDto = {
        postNo: commonTestData.post1V1.postNo,
      };

      when(postMetaRepository.findPostMeta(deepEqual({ postNo: commonTestData.post1V1.postNo }), session))
        .thenResolve([{
          isPrivate: false,
          isDeprecated: false,
          isDraft: false,
          category: commonTestData.objectIdList[1],
          series: commonTestData.objectIdList[2],
          tagList: [commonTestData.objectIdList[3], commonTestData.objectIdList[0]],
        } as PostMetaDoc]);

      await postService.updatePostMetaData(paramDto);
      verify(postMetaRepository.updatePostMeta(anything(), session)).once();
      const [updatePostMetaRepoParamDto] = capture<UpdatePostMetaRepoParamDto, ClientSession>(postMetaRepository.updatePostMeta).first();
      updatePostMetaRepoParamDto.categoryId!.should.equal(commonTestData.objectIdList[1]);
      updatePostMetaRepoParamDto.seriesId!.should.equal(commonTestData.objectIdList[2]);
      updatePostMetaRepoParamDto.tagIdList!.should.deep.equal([commonTestData.objectIdList[3], commonTestData.objectIdList[0]]);
      updatePostMetaRepoParamDto.isPrivate!.should.be.false;
      updatePostMetaRepoParamDto.isDeprecated!.should.be.false;
      updatePostMetaRepoParamDto.isDraft!.should.be.false;
    });
  });

  describe('deletePostVersion', () => {
    it('deletePostVersion - normal case', async () => {
      const paramDto: DeletePostVersionParamDto = {
        postVersionId: commonTestData.objectIdList[0],
      };

      await postService.deletePostVersion(paramDto);
      verify(postVersionRepository.deletePostVersion(anything(), session)).once();
      const [deletePostVersionRepoParamDto] = capture<DeletePostVersionRepoParamDto, ClientSession>(postVersionRepository.deletePostVersion).first();
      deletePostVersionRepoParamDto.postVersionId.should.equal(commonTestData.objectIdList[0]);
    });
  });

  describe('deletePostMeta', () => {
    it('deletePostMeta - normal case', async () => {
      const paramDto: DeletePostParamDto = {
        postNo: commonTestData.postMeta1.postNo,
      };

      await postService.deletePost(paramDto);
      verify(postMetaRepository.deletePostMeta(anything(), session)).once();
      const [deletePostMetaRepoParamDto] = capture<DeletePostMetaRepoParamDto, ClientSession>(postMetaRepository.deletePostMeta).first();
      deletePostMetaRepoParamDto.postNo.should.equal(commonTestData.postMeta1.postNo);
    });
  });
});
