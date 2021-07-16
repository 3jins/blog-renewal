import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, replaceUseTransactionForTest } from '@test/TestUtil';
import PostMetaRepository from '@src/post/repository/PostMetaRepository';
import { CreatePostMetaRepoParamDto } from '@src/post/dto/PostMetaRepoParamDto';
import Tag, { TagDoc } from '@src/tag/Tag';
import Category, { CategoryDoc } from '@src/category/Category';
import Series, { SeriesDoc } from '@src/series/Series';
import PostMeta, { PostMetaDoc } from '@src/post/model/PostMeta';
import Post, { PostDoc } from '@src/post/model/Post';

describe('PostMetaRepository test', () => {
  let sandbox;
  let postMetaRepository: PostMetaRepository;
  let conn: Connection;
  let session: ClientSession;

  before(() => {
    should();
    postMetaRepository = new PostMetaRepository();
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

  describe('createPostMeta test', () => {
    let tagList: TagDoc[];
    let categoryList: CategoryDoc[];
    let seriesList: SeriesDoc[];
    let post: PostDoc;

    beforeEach(async () => {
      tagList = await Tag.insertMany([{
        ...commonTestData.tag1,
        ...commonTestData.tag2,
        ...commonTestData.tag3,
      }], { session });
      categoryList = await Category.insertMany([{
        ...commonTestData.category1,
        ...commonTestData.category2,
        ...commonTestData.category3,
        ...commonTestData.category4,
        ...commonTestData.category5,
        ...commonTestData.category6,
        ...commonTestData.category7,
      }], { session });
      seriesList = await Series.insertMany([{
        ...commonTestData.series1,
        ...commonTestData.series2,
      }], { session });
      [post] = await Post.insertMany([{
        ...commonTestData.post1,
        lastUpdatedDate: commonTestData.dateList[0],
      }], { session });
    });

    it('createPostMeta', async () => {
      const tagIdList = tagList.map((tag) => tag._id);
      const paramDto: CreatePostMetaRepoParamDto = {
        postNo: post.postNo,
        categoryId: categoryList[0]._id,
        tagIdList,
        seriesId: seriesList[0]._id,
        createdDate: commonTestData.dateList[0],
      };

      await postMetaRepository.createPostMeta(paramDto);

      const [postMeta]: PostMetaDoc[] = await PostMeta.find().session(session);
      postMeta.postNo.should.equal(post.postNo);
      postMeta.category!.should.deep.equal(categoryList[0]._id);
      postMeta.tagList!.should.deep.equal(tagIdList);
      postMeta.series!.should.deep.equal(seriesList[0]._id);
      postMeta.createdDate!.should.deep.equal(commonTestData.dateList[0]);
      postMeta.isDeleted!.should.be.false;
      postMeta.commentCount!.should.equal(0);
      postMeta.isPrivate!.should.be.false;
      postMeta.isDeprecated!.should.be.false;
    });
  });
});
