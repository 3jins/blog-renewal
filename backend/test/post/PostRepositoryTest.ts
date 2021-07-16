import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, replaceUseTransactionForTest } from '@test/TestUtil';
import PostRepository from '@src/post/repository/PostRepository';
import { CreatePostRepoParamDto } from '@src/post/dto/PostRepoParamDto';
import Post, { PostDoc } from '@src/post/model/Post';
import Image from '@src/image/Image';

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
    await replaceUseTransactionForTest(sandbox, session);
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
  });

  describe('createPost test', () => {
    let gifImage;

    beforeEach(async () => {
      [gifImage] = (await Image.insertMany([{
        ...commonTestData.gifImage,
      }], { session }));
    });

    it('createPost', async () => {
      const paramDto1: CreatePostRepoParamDto = {
        ...commonTestData.post1,
        thumbnailImageId: gifImage,
        lastUpdatedDate: commonTestData.dateList[0],
      };
      const paramDto2: CreatePostRepoParamDto = {
        ...commonTestData.post2,
        lastUpdatedDate: commonTestData.dateList[1],
      };

      await postRepository.createPost(paramDto1);
      await postRepository.createPost(paramDto2);
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
      post1.thumbnailContent.should.equal(commonTestData.post1.thumbnailContent);
      post1.thumbnailImage!.should.deep.equal(gifImage._id);
      post1.lastUpdatedDate.should.deep.equal(commonTestData.dateList[0]);
      post1.isLatestVersion.should.equal(commonTestData.post1.isLatestVersion);
      (post1.lastVersionPost === null).should.be.true;
      post2.title.should.equal(commonTestData.post2.title);
      post2.rawContent.should.equal(commonTestData.post2.rawContent);
      post2.renderedContent.should.equal(commonTestData.post2.renderedContent);
      post2.language.should.equal(commonTestData.post2.language);
      post2.thumbnailContent.should.equal(commonTestData.post2.thumbnailContent);
      (post2.thumbnailImage === null).should.be.true;
      post2.lastUpdatedDate.should.deep.equal(commonTestData.dateList[1]);
      post2.isLatestVersion.should.equal(commonTestData.post2.isLatestVersion);
      (post2.lastVersionPost === null).should.be.true;
    });
  });
});
