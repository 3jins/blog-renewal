import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { createMongoMemoryReplSet, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, errorShouldBeThrown } from '@test/TestUtil';
import PostVersionRepository from '@src/post/repository/PostVersionRepository';
import {
  CreatePostVersionRepoParamDto,
  DeletePostVersionRepoParamDto,
  FindPostVersionRepoParamDto,
} from '@src/post/dto/PostVersionRepoParamDto';
import PostVersion, { PostVersionDoc } from '@src/post/model/PostVersion';
import Image from '@src/image/Image';
import { OBJECT_ID_PATTERN } from '@src/common/constant/RegexPattern';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('PostVersionRepository test', () => {
  let sandbox;
  let postVersionRepository: PostVersionRepository;
  let replSet: MongoMemoryReplSet;
  let conn: Connection;
  let session: ClientSession;

  before(async () => {
    should();
    postVersionRepository = new PostVersionRepository();
    replSet = await createMongoMemoryReplSet();
    conn = setConnection(replSet.getUri());
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    session = await conn.startSession();
    session.startTransaction();
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
    await replSet.stop();
  });

  describe('findPostVersion test', () => {
    beforeEach(async () => {
      await PostVersion.insertMany([
        {
          _id: commonTestData.objectIdList[0],
          ...commonTestData.post1V1,
          thumbnailImage: commonTestData.objectIdList[6],
          updatedDate: commonTestData.dateList[0],
        },
        {
          _id: commonTestData.objectIdList[1],
          ...commonTestData.post2V1,
          thumbnailImage: commonTestData.objectIdList[7],
          updatedDate: commonTestData.dateList[1],
        },
        {
          _id: commonTestData.objectIdList[2],
          ...commonTestData.post2V2,
          thumbnailImage: commonTestData.objectIdList[7],
          updatedDate: commonTestData.dateList[3],
        },
        {
          _id: commonTestData.objectIdList[3],
          ...commonTestData.post2EnV1,
          thumbnailImage: commonTestData.objectIdList[7],
          updatedDate: commonTestData.dateList[2],
        },
        {
          _id: commonTestData.objectIdList[4],
          ...commonTestData.post2EnV2,
          thumbnailImage: commonTestData.objectIdList[7],
          updatedDate: commonTestData.dateList[4],
        },
        {
          _id: commonTestData.objectIdList[5],
          ...commonTestData.post3,
          thumbnailImage: commonTestData.objectIdList[8],
          updatedDate: commonTestData.dateList[5],
        },
      ], { session });
    });

    it('findPostVersion - with full parameter', async () => {
      const paramDto: FindPostVersionRepoParamDto = {
        postNo: commonTestData.post2EnV2.postNo,
        postVersionId: commonTestData.objectIdList[4],
        title: commonTestData.post2EnV2.title,
        rawContent: commonTestData.post2EnV2.rawContent,
        renderedContent: commonTestData.post2EnV2.renderedContent,
        language: commonTestData.post2EnV2.language,
        thumbnailContent: commonTestData.post2EnV2.thumbnailContent,
        thumbnailImageId: commonTestData.objectIdList[7],
        findPostVersionByUpdatedDateDto: { from: commonTestData.dateList[0], to: commonTestData.dateList[5] },
        isLatestVersion: commonTestData.post2EnV2.isLatestVersion,
        isOnlyExactSameFieldFound: true,
      };
      const postVersionList: PostVersionDoc[] = await postVersionRepository.findPostVersion(paramDto, session);
      postVersionList.should.have.lengthOf(1);
      postVersionList[0].postNo.should.equal(commonTestData.post2EnV2.postNo);
    });

    it('findPostVersion - like search (title, renderedContent)', async () => {
      const paramDto: FindPostVersionRepoParamDto = {
        title: '프링',
        renderedContent: 'sPring', // should not be case-sensitive
        findPostVersionByUpdatedDateDto: { from: commonTestData.dateList[0], to: commonTestData.dateList[5] },
        isOnlyExactSameFieldFound: false,
      };
      const postVersionList: PostVersionDoc[] = await postVersionRepository.findPostVersion(paramDto, session);
      postVersionList.should.have.lengthOf(3);
      postVersionList[0].postNo.should.equal(commonTestData.post1V1.postNo);
      postVersionList[1].postNo.should.equal(commonTestData.post2V1.postNo);
      postVersionList[1].thumbnailContent.should.equal(commonTestData.post2V1.thumbnailContent);
      postVersionList[2].postNo.should.equal(commonTestData.post2V2.postNo);
      postVersionList[2].thumbnailContent.should.equal(commonTestData.post2V2.thumbnailContent);
    });

    it('findPostVersion - with empty parameter', async () => {
      const paramDto: FindPostVersionRepoParamDto = {};
      const postVersionList: PostVersionDoc[] = await postVersionRepository.findPostVersion(paramDto, session);
      postVersionList.should.have.lengthOf(6);
      postVersionList[0].postNo.should.equal(commonTestData.post1V1.postNo);
      postVersionList[1].postNo.should.equal(commonTestData.post2V1.postNo);
      postVersionList[2].postNo.should.equal(commonTestData.post2V2.postNo);
      postVersionList[3].postNo.should.equal(commonTestData.post2EnV1.postNo);
      postVersionList[4].postNo.should.equal(commonTestData.post2EnV2.postNo);
      postVersionList[5].postNo.should.equal(commonTestData.post3.postNo);
    });

    it('findPostVersion - findPostByUpdatedDateDto.from: O, findPostByUpdatedDateDto.to: X', async () => {
      const paramDto: FindPostVersionRepoParamDto = {
        findPostVersionByUpdatedDateDto: {
          from: commonTestData.dateList[3],
        },
      };
      const postVersionList: PostVersionDoc[] = await postVersionRepository.findPostVersion(paramDto, session);
      postVersionList.should.have.lengthOf(3);
      postVersionList.map((post) => post.postNo).should.deep.equal([
        commonTestData.post2V2.postNo,
        commonTestData.post2EnV2.postNo,
        commonTestData.post3.postNo,
      ]);
    });

    it('findPostVersion - findPostByUpdatedDateDto.from: X, findPostByUpdatedDateDto.to: O', async () => {
      const paramDto: FindPostVersionRepoParamDto = {
        findPostVersionByUpdatedDateDto: {
          to: commonTestData.dateList[3],
        },
      };
      const postVersionList: PostVersionDoc[] = await postVersionRepository.findPostVersion(paramDto, session);
      postVersionList.should.have.lengthOf(4);
      postVersionList.map((post) => post.postNo).should.deep.equal([
        commonTestData.post1V1.postNo,
        commonTestData.post2V1.postNo,
        commonTestData.post2V2.postNo,
        commonTestData.post2EnV1.postNo,
      ]);
    });
  });

  describe('createPostVersion test', () => {
    const objectIdRegex: RegExp = new RegExp(OBJECT_ID_PATTERN);
    let gifImage;

    beforeEach(async () => {
      [gifImage] = (await Image.insertMany([{
        ...commonTestData.gifImage,
      }], { session }));
    });

    it('createPostVersion', async () => {
      const paramDto1: CreatePostVersionRepoParamDto = {
        ...commonTestData.post1V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        thumbnailImageId: gifImage,
        updatedDate: commonTestData.dateList[0],
      };
      const paramDto2: CreatePostVersionRepoParamDto = {
        ...commonTestData.post2V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        updatedDate: commonTestData.dateList[1],
      };

      const result1 = await postVersionRepository.createPostVersion(paramDto1, session);
      const result2 = await postVersionRepository.createPostVersion(paramDto2, session);

      objectIdRegex.test(result1).should.be.true;
      objectIdRegex.test(result2).should.be.true;

      const postVersionList: PostVersionDoc[] = await PostVersion.find().session(session);
      postVersionList.should.have.lengthOf(2);
      const [postVersion1, postVersion2]: PostVersionDoc[] = postVersionList;

      postVersion1.should.not.be.empty;
      postVersion2.should.not.be.empty;
      postVersion2.postNo.should.equal(postVersion1.postNo + 1);

      postVersion1.title.should.equal(commonTestData.post1V1.title);
      postVersion1.rawContent.should.equal(commonTestData.post1V1.rawContent);
      postVersion1.renderedContent.should.equal(commonTestData.post1V1.renderedContent);
      postVersion1.language.should.equal(commonTestData.post1V1.language);
      postVersion1.thumbnailContent.should.equal(commonTestData.simpleTexts[0]);
      postVersion1.thumbnailImage!.should.deep.equal(gifImage._id);
      postVersion1.updatedDate.should.deep.equal(commonTestData.dateList[0]);
      postVersion1.isLatestVersion.should.equal(commonTestData.post1V1.isLatestVersion);
      (postVersion1.lastPostVersion === null).should.be.true;
      postVersion2.title.should.equal(commonTestData.post2V1.title);
      postVersion2.rawContent.should.equal(commonTestData.post2V1.rawContent);
      postVersion2.renderedContent.should.equal(commonTestData.post2V1.renderedContent);
      postVersion2.language.should.equal(commonTestData.post2V1.language);
      postVersion2.thumbnailContent.should.equal(commonTestData.simpleTexts[0]);
      (postVersion2.thumbnailImage === null).should.be.true;
      postVersion2.updatedDate.should.deep.equal(commonTestData.dateList[1]);
      postVersion2.isLatestVersion.should.equal(commonTestData.post2V1.isLatestVersion);
      (postVersion2.lastPostVersion === null).should.be.true;
    });

    it('createPostVersion - add new version of the same post', async () => {
      const paramDto1: CreatePostVersionRepoParamDto = {
        ...commonTestData.post1V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        updatedDate: commonTestData.dateList[0],
      };
      const paramDto2: CreatePostVersionRepoParamDto = {
        ...commonTestData.post1V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        updatedDate: commonTestData.dateList[1],
        rawContent: commonTestData.post1DataToBeUpdated.rawContent,
        renderedContent: commonTestData.post1DataToBeUpdated.renderedContent,
      };

      const result1 = await postVersionRepository.createPostVersion(paramDto1, session);
      const result2 = await postVersionRepository.createPostVersion(paramDto2, session);

      objectIdRegex.test(result1).should.be.true;
      objectIdRegex.test(result2).should.be.true;

      const postVersionList: PostVersionDoc[] = await PostVersion.find().session(session);
      postVersionList.should.have.lengthOf(2);
      const [postVersion1, postVersion2]: PostVersionDoc[] = postVersionList;
      postVersion1.postNo.should.be.equal(postVersion2.postNo);
      (postVersion1.lastPostVersion === null).should.be.true;
      postVersion2.lastPostVersion.should.deep.equal(postVersion1._id);
    });
  });

  describe('deletePostVersion test', () => {
    beforeEach(async () => {
      await PostVersion.insertMany([
        {
          _id: commonTestData.objectIdList[0],
          ...commonTestData.post1V1,
          thumbnailImage: commonTestData.objectIdList[3],
          updatedDate: commonTestData.dateList[0],
        },
        {
          _id: commonTestData.objectIdList[1],
          ...commonTestData.post2V1,
          thumbnailImage: commonTestData.objectIdList[4],
          updatedDate: commonTestData.dateList[1],
        },
        {
          _id: commonTestData.objectIdList[2],
          ...commonTestData.post2V2,
          thumbnailImage: commonTestData.objectIdList[4],
          updatedDate: commonTestData.dateList[3],
        },
      ], { session });
    });

    it('deletePostVersion - normal case', async () => {
      const paramDto: DeletePostVersionRepoParamDto = {
        postVersionId: commonTestData.objectIdList[1],
      };
      await postVersionRepository.deletePostVersion(paramDto, session);
      const postVersionList: PostVersionDoc[] = await PostVersion.find().session(session);
      postVersionList.should.have.lengthOf(2);
      postVersionList[0].id.should.equal(commonTestData.objectIdList[0]);
      postVersionList[1].id.should.equal(commonTestData.objectIdList[2]);
    });

    it('deletePostVersion - try deleting an inexistent post', async () => {
      const paramDto: DeletePostVersionRepoParamDto = {
        postVersionId: commonTestData.objectIdList[10],
      };
      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.POST_NOT_FOUND, [commonTestData.objectIdList[10], 'postVersionId']),
        (_paramDto, _session) => postVersionRepository.deletePostVersion(_paramDto, _session),
        paramDto,
        session,
      );
      const postVersionList: PostVersionDoc[] = await PostVersion.find().session(session);
      postVersionList.should.have.lengthOf(3);
    });
  });
});
