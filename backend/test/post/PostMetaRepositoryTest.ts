import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, errorShouldBeThrown } from '@test/TestUtil';
import PostMetaRepository from '@src/post/repository/PostMetaRepository';
import {
  CreatePostMetaRepoParamDto,
  FindPostMetaRepoParamDto,
  UpdatePostMetaRepoParamDto,
} from '@src/post/dto/PostMetaRepoParamDto';
import Tag, { TagDoc } from '@src/tag/Tag';
import Category, { CategoryDoc } from '@src/category/Category';
import Series, { SeriesDoc } from '@src/series/Series';
import PostMeta, { PostMetaDoc } from '@src/post/model/PostMeta';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';

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
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
  });

  describe('findPostMeta test', () => {
    let categoryList: CategoryDoc[];
    let seriesList: SeriesDoc[];
    let tagList: TagDoc[];
    let postMetaList: PostMetaDoc[];

    beforeEach(async () => {
      categoryList = await Category.insertMany([
        { ...commonTestData.category1 },
        { ...commonTestData.category2 },
        { ...commonTestData.category3 },
        { ...commonTestData.category4 },
        { ...commonTestData.category5 },
        { ...commonTestData.category6 },
        { ...commonTestData.category7 },
      ], { session });
      seriesList = await Series.insertMany([
        { ...commonTestData.series1 },
        { ...commonTestData.series2 },
      ], { session });
      tagList = await Tag.insertMany([
        { ...commonTestData.tag1 },
        { ...commonTestData.tag2 },
        { ...commonTestData.tag3 },
      ], { session });
      await PostMeta.insertMany([{
        postNo: 7,
        category: categoryList[0]._id,
        series: seriesList[0]._id,
        tagList: [tagList[0]._id, tagList[1]._id],
        createdDate: commonTestData.dateList[0],
        isDeleted: false,
        commentCount: 3,
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
      }, {
        postNo: 13,
        category: categoryList[1]._id,
        series: seriesList[1]._id,
        tagList: [tagList[1]._id, tagList[2]._id],
        createdDate: commonTestData.dateList[1],
        isDeleted: true,
        commentCount: 2,
        isPrivate: true,
        isDeprecated: true,
        isDraft: true,
      }, {
        postNo: 93,
        category: categoryList[0]._id,
        series: seriesList[1]._id,
        tagList: [tagList[0]._id, tagList[2]._id],
        createdDate: commonTestData.dateList[2],
        isDeleted: false,
        commentCount: 1,
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
      }], { session });

      postMetaList = await PostMeta
        .find()
        .populate('category')
        .populate('series')
        .populate('tagList')
        .session(session);

      Category.updateOne({ name: categoryList[0].name }, { postMetaList: [postMetaList[0]._id, postMetaList[2]._id] }, { session });
      Category.updateOne({ name: categoryList[1].name }, { postMetaList: [postMetaList[0]._id] }, { session });
      categoryList = await Category.find().session(session);

      Series.updateOne({ name: seriesList[0].name }, { postMetaList: [postMetaList[0]._id] }, { session });
      Series.updateOne({ name: seriesList[1].name }, { postMetaList: [postMetaList[1]._id, postMetaList[2]._id] }, { session });
      seriesList = await Series.find().session(session);

      Tag.updateOne({ name: tagList[0].name }, { postMetaList: [postMetaList[0]._id, postMetaList[0]._id] }, { session });
      Tag.updateOne({ name: tagList[1].name }, { postMetaList: [postMetaList[0]._id, postMetaList[0]._id] }, { session });
      tagList = await Tag.find().session(session);
    });

    it('findPostMeta - with full parameter', async () => {
      const paramDto: FindPostMetaRepoParamDto = {
        postNo: postMetaList[0].postNo,
        categoryId: postMetaList[0].category.id,
        seriesId: postMetaList[0].series.id,
        tagIdList: postMetaList[0].tagList!.map((tag) => tag.id),
        isPrivate: postMetaList[0].isPrivate,
        isDeprecated: postMetaList[0].isDeprecated,
        isDraft: postMetaList[0].isDraft,
      };
      const foundPostMetaList: PostMetaDoc[] = await postMetaRepository.findPostMeta(paramDto, session);
      foundPostMetaList.should.have.lengthOf(1);
      foundPostMetaList[0].postNo.should.equal(postMetaList[0].postNo);
      foundPostMetaList[0].category.id.should.equal(postMetaList[0].category.id);
      [foundPostMetaList[0].category.id].should.deep.equal(
        categoryList
          .filter((category) => category.id === postMetaList[0].category.id)
          .map((category) => category.id),
      );
      foundPostMetaList[0].series.id.should.equal(postMetaList[0].series.id);
      [foundPostMetaList[0].series.id].should.deep.equal(
        seriesList
          .filter((series) => series.id === postMetaList[0].series.id)
          .map((series) => series.id),
      );
      foundPostMetaList[0].tagList!.map((tag) => tag.id).should.deep.equal(
        postMetaList[0].tagList!.map((tag) => tag.id),
      );
      foundPostMetaList[0].tagList!.map((tag) => tag.id).should.deep.equal(
        tagList
          .filter((foundPostTag) => postMetaList[0].tagList!.map((tag) => tag.id).includes(foundPostTag.id))
          .map((foundPostTag) => foundPostTag.id),
      );
      foundPostMetaList[0].createdDate.should.deep.equal(postMetaList[0].createdDate);
      foundPostMetaList[0].isDeleted!.should.equal(postMetaList[0].isDeleted);
      foundPostMetaList[0].commentCount!.should.equal(postMetaList[0].commentCount);
      foundPostMetaList[0].isPrivate!.should.equal(postMetaList[0].isPrivate);
      foundPostMetaList[0].isDeprecated!.should.equal(postMetaList[0].isDeprecated);
      foundPostMetaList[0].isDraft!.should.equal(postMetaList[0].isDraft);
    });

    it('findPostMeta - with empty parameter', async () => {
      const foundPostMetaList: PostMetaDoc[] = await postMetaRepository.findPostMeta({}, session);
      foundPostMetaList.should.have.lengthOf(postMetaList.length);
      foundPostMetaList[0].postNo.should.equal(postMetaList[2].postNo);
      foundPostMetaList[1].postNo.should.equal(postMetaList[1].postNo);
      foundPostMetaList[2].postNo.should.equal(postMetaList[0].postNo);
      foundPostMetaList[2].category.id.should.equal(postMetaList[0].category.id);
      [foundPostMetaList[2].category.id].should.deep.equal(
        categoryList
          .filter((category) => category.id === postMetaList[0].category.id)
          .map((category) => category.id),
      );
      foundPostMetaList[2].series.id.should.equal(postMetaList[0].series.id);
      [foundPostMetaList[2].series.id].should.deep.equal(
        seriesList
          .filter((series) => series.id === postMetaList[0].series.id)
          .map((series) => series.id),
      );
      foundPostMetaList[2].tagList!.map((tag) => tag.id).should.deep.equal(
        postMetaList[0].tagList!.map((tag) => tag.id),
      );
      foundPostMetaList[2].tagList!.map((tag) => tag.id).should.deep.equal(
        tagList
          .filter((foundPostTag) => postMetaList[0].tagList!.map((tag) => tag.id).includes(foundPostTag.id))
          .map((foundPostTag) => foundPostTag.id),
      );
      foundPostMetaList[2].createdDate.should.deep.equal(postMetaList[0].createdDate);
      foundPostMetaList[2].isDeleted!.should.equal(postMetaList[0].isDeleted);
      foundPostMetaList[2].commentCount!.should.equal(postMetaList[0].commentCount);
      foundPostMetaList[2].isPrivate!.should.equal(postMetaList[0].isPrivate);
      foundPostMetaList[2].isDeprecated!.should.equal(postMetaList[0].isDeprecated);
      foundPostMetaList[2].isDraft!.should.equal(postMetaList[0].isDraft);
    });

    it('findPostMeta - with inexistent postNo', async () => {
      const paramDto: FindPostMetaRepoParamDto = {
        postNo: 1993,
      };
      const foundPostMetaList: PostMetaDoc[] = await postMetaRepository.findPostMeta(paramDto, session);
      foundPostMetaList.should.be.empty;
    });

    it('findPostMeta - with inexistent categoryId', async () => {
      const paramDto: FindPostMetaRepoParamDto = {
        categoryId: commonTestData.objectIdList[3],
      };
      const foundPostMetaList: PostMetaDoc[] = await postMetaRepository.findPostMeta(paramDto, session);
      foundPostMetaList.should.be.empty;
    });
  });

  describe('createPostMeta test', () => {
    let tagList: TagDoc[];
    let categoryList: CategoryDoc[];
    let seriesList: SeriesDoc[];

    beforeEach(async () => {
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
      tagList = await Tag.insertMany([{
        ...commonTestData.tag1,
        ...commonTestData.tag2,
        ...commonTestData.tag3,
      }], { session });
    });

    it('createPostMeta', async () => {
      const paramDto1: CreatePostMetaRepoParamDto = {
        createdDate: commonTestData.dateList[0],
      };
      const tagIdList = tagList.map((tag) => tag._id);
      const paramDto2: CreatePostMetaRepoParamDto = {
        categoryId: categoryList[0]._id,
        seriesId: seriesList[0]._id,
        createdDate: commonTestData.dateList[1],
        tagIdList,
      };

      await postMetaRepository.createPostMeta(paramDto1, session);
      await postMetaRepository.createPostMeta(paramDto2, session);

      const [postMeta1, postMeta2]: PostMetaDoc[] = await PostMeta.find().sort({ postNo: 1 }).session(session);
      postMeta2.postNo.should.equal(postMeta1.postNo + 1);
      postMeta2.category!.should.deep.equal(categoryList[0]._id);
      postMeta2.series!.should.deep.equal(seriesList[0]._id);
      postMeta2.tagList!.should.deep.equal(tagIdList);
      postMeta2.createdDate!.should.deep.equal(commonTestData.dateList[1]);
      postMeta2.isDeleted!.should.be.false;
      postMeta2.commentCount!.should.equal(0);
      postMeta2.isPrivate!.should.be.false;
      postMeta2.isDeprecated!.should.be.false;
      postMeta2.isDraft!.should.be.false;
    });
  });

  describe('updatePostMeta test', () => {
    let categoryList: CategoryDoc[];
    let seriesList: SeriesDoc[];
    let tagList: TagDoc[];
    let originalPostMeta: PostMetaDoc;

    beforeEach(async () => {
      categoryList = await Category.insertMany([
        { ...commonTestData.category1 },
        { ...commonTestData.category2 },
        { ...commonTestData.category3 },
        { ...commonTestData.category4 },
        { ...commonTestData.category5 },
        { ...commonTestData.category6 },
        { ...commonTestData.category7 },
      ], { session });
      seriesList = await Series.insertMany([
        { ...commonTestData.series1 },
        { ...commonTestData.series2 },
      ], { session });
      tagList = await Tag.insertMany([
        { ...commonTestData.tag1 },
        { ...commonTestData.tag2 },
        { ...commonTestData.tag3 },
      ], { session });
      [originalPostMeta] = await PostMeta.insertMany([{
        postNo: 7,
        category: categoryList[0]._id,
        series: seriesList[0]._id,
        tagList: [tagList[0]._id, tagList[1]._id],
        createdDate: commonTestData.dateList[0],
        isDeleted: false,
        commentCount: 1,
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
      }], { session });

      Series.updateOne({ name: seriesList[0].name }, { postMetaList: [originalPostMeta._id] }, { session });
      seriesList[0] = (await Series.findById(seriesList[0]._id).session(session)) as SeriesDoc;
      Tag.updateOne({ name: tagList[0].name }, { postMetaList: [originalPostMeta._id] }, { session });
      tagList[0] = (await Tag.findById(tagList[0]._id).session(session)) as TagDoc;
      Tag.updateOne({ name: tagList[1].name }, { postMetaList: [originalPostMeta._id] }, { session });
      tagList[1] = (await Tag.findById(tagList[1]._id).session(session)) as TagDoc;
    });

    it('updatePostMeta - with empty parameter', async () => {
      const paramDto: UpdatePostMetaRepoParamDto = { postNo: originalPostMeta.postNo };

      await postMetaRepository.updatePostMeta(paramDto, session);

      const [updatedPostMeta]: PostMetaDoc[] = await PostMeta.find().sort({ postNo: 1 }).session(session);
      updatedPostMeta.postNo.should.equal(originalPostMeta.postNo);
      updatedPostMeta.category.should.deep.equal(originalPostMeta.category!);
      updatedPostMeta.series.should.deep.equal(originalPostMeta.series!);
      updatedPostMeta.tagList!.should.deep.equal(originalPostMeta.tagList!);
      updatedPostMeta.createdDate.should.deep.equal(originalPostMeta.createdDate);
      updatedPostMeta.isDeleted!.should.equal(originalPostMeta.isDeleted!);
      updatedPostMeta.commentCount!.should.equal(originalPostMeta.commentCount!);
      updatedPostMeta.isPrivate!.should.equal(originalPostMeta.isPrivate!);
      updatedPostMeta.isDeprecated!.should.equal(originalPostMeta.isDeprecated!);
      updatedPostMeta.isDraft!.should.equal(originalPostMeta.isDraft!);
    });

    it('updatePostMeta - with full parameter', async () => {
      const paramDto: UpdatePostMetaRepoParamDto = {
        postNo: originalPostMeta.postNo,
        categoryId: categoryList[1]._id,
        seriesId: seriesList[1]._id,
        tagIdList: [tagList[1]._id, tagList[2]._id],
        isDeleted: true,
        commentCount: 100,
        isPrivate: true,
        isDeprecated: true,
        isDraft: true,
      };

      await postMetaRepository.updatePostMeta(paramDto, session);

      const [updatedPostMeta]: PostMetaDoc[] = await PostMeta.find({ postNo: originalPostMeta.postNo }).session(session);
      updatedPostMeta.postNo.should.equal(originalPostMeta.postNo);
      updatedPostMeta.category!.should.deep.equal(categoryList[1]._id);
      updatedPostMeta.tagList!.should.deep.equal([tagList[1]._id, tagList[2]._id]);
      updatedPostMeta.series!.should.deep.equal(seriesList[1]._id);
      updatedPostMeta.createdDate!.should.deep.equal(commonTestData.dateList[0]);
      updatedPostMeta.isDeleted!.should.be.true;
      updatedPostMeta.commentCount!.should.equal(100);
      updatedPostMeta.isPrivate!.should.be.true;
      updatedPostMeta.isDeprecated!.should.be.true;
      updatedPostMeta.isDraft!.should.be.true;
    });

    it('updatePostMeta - with inexistent postNo', async () => {
      const paramDto: UpdatePostMetaRepoParamDto = { postNo: 930713 };
      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.POST_NOT_FOUND, ['930713', 'postNo']),
        (_paramDto, _session) => postMetaRepository.updatePostMeta(_paramDto, _session),
        paramDto,
        session,
      );
    });
  });
});
