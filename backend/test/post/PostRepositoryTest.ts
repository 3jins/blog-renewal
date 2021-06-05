import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, replaceUseTransactionForTest } from '@test/TestUtil';
import PostRepository from '@src/post/PostRepository';
import { CreatePostRepoParamDto } from '@src/post/PostDto';
import Tag, { TagDoc } from '@src/tag/Tag';
import Category, { CategoryDoc } from '@src/category/Category';
import Series, { SeriesDoc } from '@src/series/Series';
import Post, { PostDoc } from '@src/post/Post';

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

  it('createPost', async () => {
    const categories: CategoryDoc = (await Category.insertMany([commonTestData.childCategory], { session }))[0];
    const tags: TagDoc[] = await Tag.insertMany([commonTestData.tag1], { session });
    const series: SeriesDoc = (await Series.insertMany([commonTestData.series], { session }))[0];
    const paramDto: CreatePostRepoParamDto = {
      ...commonTestData.post1,
      categoryId: categories._id,
      tagIdList: tags.map((tag) => tag._id),
      seriesId: series._id,
    };

    await postRepository.createPost(paramDto);
    const posts: PostDoc[] = await Post.find().session(session);
    posts.should.have.lengthOf(1);
    const post: PostDoc = posts[0];
    post.should.not.be.empty;
    post.should.contain(commonTestData.post1);
    (post.lastVersionPost !== undefined).should.be.true;
    (post.lastVersionPost === null).should.be.true;
    (post.isLatestVersion !== undefined).should.be.true;
    post.isLatestVersion!.should.be.true;
    (post.isDeleted !== undefined).should.be.true;
    post.isDeleted!.should.be.false;
    (post.createdDate !== undefined).should.be.true;
    post.createdDate!.getTime().should.closeTo(new Date().getTime(), 3000); // Expect difference to be less than 3 seconds
    (post.commentCount !== undefined).should.be.true;
    post.commentCount!.should.equal(0);
  });
});
