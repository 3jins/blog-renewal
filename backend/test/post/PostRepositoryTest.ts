import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction } from '@test/TestUtil';
import PostRepository from '@src/post/repository/PostRepository';
import { CreatePostRepoParamDto, FindPostRepoParamDto } from '@src/post/dto/PostRepoParamDto';
import Post, { PostDoc } from '@src/post/model/Post';
import Image from '@src/image/Image';
import { OBJECT_ID_PATTERN } from '@src/common/constant/RegexPattern';

describe('PostRepository test', () => {
  let sandbox;
  let postRepository: PostRepository;
  let conn: Connection;
  let session: ClientSession;

  before(() => {
    should();
    postRepository = new PostRepository();
    setConnection();
    conn = getConnection();
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
  });

  describe('findPost test', () => {
    beforeEach(async () => {
      await Post.insertMany([
        {
          ...commonTestData.post1,
          thumbnailImage: commonTestData.objectIdList[0],
          updatedDate: commonTestData.dateList[0],
        },
        {
          ...commonTestData.post2V1,
          thumbnailImage: commonTestData.objectIdList[1],
          updatedDate: commonTestData.dateList[1],
        },
        {
          ...commonTestData.post2V2,
          thumbnailImage: commonTestData.objectIdList[1],
          updatedDate: commonTestData.dateList[3],
        },
        {
          ...commonTestData.post2EnV1,
          thumbnailImage: commonTestData.objectIdList[1],
          updatedDate: commonTestData.dateList[2],
        },
        {
          ...commonTestData.post2EnV2,
          thumbnailImage: commonTestData.objectIdList[1],
          updatedDate: commonTestData.dateList[4],
        },
        {
          ...commonTestData.post3,
          thumbnailImage: commonTestData.objectIdList[2],
          updatedDate: commonTestData.dateList[5],
        },
      ], { session });
    });

    it('findPost - with full parameter', async () => {
      const paramDto: FindPostRepoParamDto = {
        postNo: commonTestData.post2EnV2.postNo,
        title: commonTestData.post2EnV2.title,
        rawContent: commonTestData.post2EnV2.rawContent,
        renderedContent: commonTestData.post2EnV2.renderedContent,
        language: commonTestData.post2EnV2.language,
        thumbnailContent: commonTestData.post2EnV2.thumbnailContent,
        thumbnailImageId: commonTestData.objectIdList[1],
        findPostByUpdatedDateDto: { from: commonTestData.dateList[0], to: commonTestData.dateList[5] },
        isLatestVersion: commonTestData.post2EnV2.isLatestVersion,
        isOnlyExactSameFieldFound: true,
      };
      const posts: PostDoc[] = await postRepository.findPost(paramDto, session);
      posts.should.have.lengthOf(1);
      posts[0].postNo.should.equal(commonTestData.post2EnV2.postNo);
    });

    it('findPost - like search (title, renderedContent)', async () => {
      const paramDto: FindPostRepoParamDto = {
        title: '프링',
        renderedContent: '는',
        findPostByUpdatedDateDto: { from: commonTestData.dateList[0], to: commonTestData.dateList[5] },
        isOnlyExactSameFieldFound: false,
      };
      const posts: PostDoc[] = await postRepository.findPost(paramDto, session);
      posts.should.have.lengthOf(3);
      posts[0].postNo.should.equal(commonTestData.post1.postNo);
      posts[1].postNo.should.equal(commonTestData.post2V1.postNo);
      posts[1].thumbnailContent.should.equal(commonTestData.post2V1.thumbnailContent);
      posts[2].postNo.should.equal(commonTestData.post2V2.postNo);
      posts[2].thumbnailContent.should.equal(commonTestData.post2V2.thumbnailContent);
    });

    it('findPost - with empty parameter', async () => {
      const paramDto: FindPostRepoParamDto = {};
      const posts: PostDoc[] = await postRepository.findPost(paramDto, session);
      posts.should.have.lengthOf(6);
      posts[0].postNo.should.equal(commonTestData.post1.postNo);
      posts[1].postNo.should.equal(commonTestData.post2V1.postNo);
      posts[2].postNo.should.equal(commonTestData.post2V2.postNo);
      posts[3].postNo.should.equal(commonTestData.post2EnV1.postNo);
      posts[4].postNo.should.equal(commonTestData.post2EnV2.postNo);
      posts[5].postNo.should.equal(commonTestData.post3.postNo);
    });

    it('findPost - findPostByUpdatedDateDto.from: O, findPostByUpdatedDateDto.to: X', async () => {
      const paramDto: FindPostRepoParamDto = {
        findPostByUpdatedDateDto: {
          from: commonTestData.dateList[3],
        },
      };
      const posts: PostDoc[] = await postRepository.findPost(paramDto, session);
      posts.should.have.lengthOf(3);
      posts.map((post) => post.postNo).should.deep.equal([
        commonTestData.post2V2.postNo,
        commonTestData.post2EnV2.postNo,
        commonTestData.post3.postNo,
      ]);
    });

    it('findPost - findPostByUpdatedDateDto.from: X, findPostByUpdatedDateDto.to: O', async () => {
      const paramDto: FindPostRepoParamDto = {
        findPostByUpdatedDateDto: {
          to: commonTestData.dateList[3],
        },
      };
      const posts: PostDoc[] = await postRepository.findPost(paramDto, session);
      posts.should.have.lengthOf(4);
      posts.map((post) => post.postNo).should.deep.equal([
        commonTestData.post1.postNo,
        commonTestData.post2V1.postNo,
        commonTestData.post2V2.postNo,
        commonTestData.post2EnV1.postNo,
      ]);
    });
  });

  describe('createPost test', () => {
    const objectIdRegex: RegExp = new RegExp(OBJECT_ID_PATTERN);
    let gifImage;

    beforeEach(async () => {
      [gifImage] = (await Image.insertMany([{
        ...commonTestData.gifImage,
      }], { session }));
    });

    it('createPost', async () => {
      const paramDto1: CreatePostRepoParamDto = {
        ...commonTestData.post1,
        thumbnailContent: commonTestData.simpleTexts[0],
        thumbnailImageId: gifImage,
        updatedDate: commonTestData.dateList[0],
      };
      const paramDto2: CreatePostRepoParamDto = {
        ...commonTestData.post2V1,
        thumbnailContent: commonTestData.simpleTexts[0],
        updatedDate: commonTestData.dateList[1],
      };

      const result1 = await postRepository.createPost(paramDto1, session);
      const result2 = await postRepository.createPost(paramDto2, session);

      objectIdRegex.test(result1).should.be.true;
      objectIdRegex.test(result2).should.be.true;

      const posts: PostDoc[] = await Post.find().session(session);
      posts.should.have.lengthOf(2);
      const [post1, post2]: PostDoc[] = posts;

      post1.should.not.be.empty;
      post2.should.not.be.empty;
      post2.postNo.should.equal(post1.postNo + 1);

      post1.title.should.equal(commonTestData.post1.title);
      post1.rawContent.should.equal(commonTestData.post1.rawContent);
      post1.renderedContent.should.equal(commonTestData.post1.renderedContent);
      post1.language.should.equal(commonTestData.post1.language);
      post1.thumbnailContent.should.equal(commonTestData.simpleTexts[0]);
      post1.thumbnailImage!.should.deep.equal(gifImage._id);
      post1.updatedDate.should.deep.equal(commonTestData.dateList[0]);
      post1.isLatestVersion.should.equal(commonTestData.post1.isLatestVersion);
      (post1.lastVersionPost === null).should.be.true;
      post2.title.should.equal(commonTestData.post2V1.title);
      post2.rawContent.should.equal(commonTestData.post2V1.rawContent);
      post2.renderedContent.should.equal(commonTestData.post2V1.renderedContent);
      post2.language.should.equal(commonTestData.post2V1.language);
      post2.thumbnailContent.should.equal(commonTestData.simpleTexts[0]);
      (post2.thumbnailImage === null).should.be.true;
      post2.updatedDate.should.deep.equal(commonTestData.dateList[1]);
      post2.isLatestVersion.should.equal(commonTestData.post2V1.isLatestVersion);
      (post2.lastVersionPost === null).should.be.true;
    });

    it('createPost - add new version of the same post', async () => {
      const paramDto1: CreatePostRepoParamDto = {
        ...commonTestData.post1,
        thumbnailContent: commonTestData.simpleTexts[0],
        updatedDate: commonTestData.dateList[0],
      };
      const paramDto2: CreatePostRepoParamDto = {
        ...commonTestData.post1,
        thumbnailContent: commonTestData.simpleTexts[0],
        updatedDate: commonTestData.dateList[1],
        rawContent: commonTestData.post1DataToBeUpdated.rawContent,
        renderedContent: commonTestData.post1DataToBeUpdated.renderedContent,
      };

      const result1 = await postRepository.createPost(paramDto1, session);
      const result2 = await postRepository.createPost(paramDto2, session);

      objectIdRegex.test(result1).should.be.true;
      objectIdRegex.test(result2).should.be.true;

      const posts: PostDoc[] = await Post.find().session(session);
      posts.should.have.lengthOf(2);
      const [post1, post2]: PostDoc[] = posts;
      post1.postNo.should.be.equal(post2.postNo);
      (post1.lastVersionPost === null).should.be.true;
      post2.lastVersionPost.should.deep.equal(post1._id);
    });
  });
});
