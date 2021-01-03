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
    const categories: CategoryDoc = (await Category.create([commonTestData.childCategory], { session }))[0];
    const tags: TagDoc[] = await Tag.create([commonTestData.tag], { session });
    const series: SeriesDoc = (await Series.create([commonTestData.series], { session }))[0];
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
  });
});