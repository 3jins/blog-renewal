import _ from 'lodash';
import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { createMongoMemoryReplSet, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, errorShouldBeThrown } from '@test/TestUtil';
import SeriesRepository from '@src/series/SeriesRepository';
import {
  CreateSeriesRepoParamDto,
  DeleteSeriesRepoParamDto,
  FindSeriesRepoParamDto,
  UpdateSeriesRepoParamDto,
} from '@src/series/dto/SeriesRepoParamDto';
import Series, { SeriesDoc } from '@src/series/Series';
import PostMeta, { PostMetaDoc } from '@src/post/model/PostMeta';
import Image from '@src/image/Image';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('SeriesRepository test', () => {
  let sandbox;
  let seriesRepository: SeriesRepository;
  let replSet: MongoMemoryReplSet;
  let conn: Connection;
  let session: ClientSession;

  before(async () => {
    should();
    seriesRepository = new SeriesRepository();
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

  describe('findSeries test', () => {
    let postMetaIdList;

    beforeEach(async () => {
      const series1 = (await Series.insertMany([commonTestData.series1], { session }))[0]; // 심슨
      const series2 = (await Series.insertMany([commonTestData.series2], { session }))[0]; // 취업기

      const postMeta1 = (await PostMeta.insertMany([{
        postNo: 1,
        series: series1._id,
        createdDate: commonTestData.dateList[0],
      }], { session }))[0];
      const postMeta2 = (await PostMeta.insertMany([{
        postNo: 2,
        series: series2._id,
        createdDate: commonTestData.dateList[1],
      }], { session }))[0];
      const postMeta3 = (await PostMeta.insertMany([{
        postNo: 3,
        series: series1._id,
        createdDate: commonTestData.dateList[2],
      }], { session }))[0];
      postMetaIdList = [postMeta1._id.toString(), postMeta2._id.toString(), postMeta3._id.toString()];

      await Series.updateOne({ _id: series1._id }, { postMetaList: [postMetaIdList[0], postMetaIdList[2]] }, { session });
      await Series.updateOne({ _id: series2._id }, { postMetaList: [postMetaIdList[1]] }, { session });
    });

    it('findSeries - by exact name', async () => {
      const paramDto: FindSeriesRepoParamDto = {
        name: commonTestData.series2.name,
        isOnlyExactNameFound: true,
      };
      const series: SeriesDoc[] = await seriesRepository.findSeries(paramDto, session);
      series.should.have.lengthOf(1);
      series[0].name.should.equal(commonTestData.series2.name);
    });

    it('findSeries - by name (like search)', async () => {
      const paramDto1: FindSeriesRepoParamDto = {
        name: '이',
        isOnlyExactNameFound: false,
      };
      const series1: SeriesDoc[] = await seriesRepository.findSeries(paramDto1, session);
      series1.should.have.lengthOf(2);

      const paramDto2: FindSeriesRepoParamDto = {
        name: '네이버',
        isOnlyExactNameFound: false,
      };
      const series2: SeriesDoc[] = await seriesRepository.findSeries(paramDto2, session);
      series2.should.have.lengthOf(1);
      series2[0].name.should.equal(commonTestData.series2.name);
    });

    it('findSeries - with empty parameter', async () => {
      const series: SeriesDoc[] = await seriesRepository.findSeries({}, session);
      series.should.have.lengthOf(2);
    });
  });

  describe('createSeries test', () => {
    let series2Id;
    let postMetaList;
    let gifImage;

    beforeEach(async () => {
      series2Id = (await Series.insertMany([commonTestData.series1], { session }))[0]._id; // 심슨

      postMetaList = (await PostMeta.insertMany([{
        postNo: 1,
        createdDate: commonTestData.dateList[0],
      }, {
        postNo: 2,
        series: series2Id,
        createdDate: commonTestData.dateList[1],
      }], { session }))
        .map((post) => post.toObject());

      [gifImage] = (await Image.insertMany([{
        ...commonTestData.gifImage,
      }], { session }));
    });

    it('createSeries - thumbnailImage: X, postMetaList: empty', async () => {
      const paramDto: CreateSeriesRepoParamDto = {
        ...commonTestData.series2,
      };

      await seriesRepository.createSeries(paramDto, session);

      const series: (SeriesDoc | null) = await Series.findOne({ name: commonTestData.series2.name }).session(session).lean();
      series!.should.not.be.empty;
      series!.name.should.equal(commonTestData.series2.name);
      series!.postMetaList!.should.be.empty;

      const postMeta1: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post1V1.postNo }).session(session).lean();
      _.isEmpty(postMeta1!.series!).should.be.true; // should not be updated

      const postMeta2: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post2V1.postNo }).session(session).lean();
      postMeta2!.series!.should.deep.equal(series2Id); // should not be updated
    });

    it('createSeries - thumbnailImage: O, postMetaList: O', async () => {
      const paramDto: CreateSeriesRepoParamDto = {
        ...commonTestData.series2,
        thumbnailImage: gifImage,
        postMetaList: [postMetaList[0]],
      };

      await seriesRepository.createSeries(paramDto, session);

      const series: (SeriesDoc | null) = await Series.findOne({ name: commonTestData.series2.name }).session(session).lean();
      series!.should.not.be.empty;
      series!.name.should.equal(commonTestData.series2.name);
      series!.thumbnailImage!.should.deep.equal(gifImage._id);
      series!.postMetaList!.should.deep.equal([postMetaList[0]._id]);

      const postMeta1: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post1V1.postNo }).session(session).lean();
      postMeta1!.series!.should.deep.equal(series!._id); // should be updated (added)

      const postMeta2: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post2V1.postNo }).session(session).lean();
      postMeta2!.series!.should.deep.equal(series2Id); // should not be updated
    });

    it('createSeries - with postMetaList but one of them is already belong to another series', async () => {
      const paramDto: CreateSeriesRepoParamDto = {
        ...commonTestData.series2,
        thumbnailImage: gifImage,
        postMetaList: [postMetaList[1]],
      };

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.ALREADY_BELONG_TO_ANOTHER_SERIES, [postMetaList[1].postNo.toString(), commonTestData.series1.name]),
        async (_paramDto, _session) => seriesRepository.createSeries(_paramDto, _session),
        paramDto,
        session,
      );
    });
  });

  describe('updateSeries test', () => {
    let seriesList;
    let postMetaList;
    let gifImageId;
    let pngImageId;

    beforeEach(async () => {
      [gifImageId, pngImageId] = (await Image.insertMany([{
        ...commonTestData.gifImage,
      }, {
        ...commonTestData.pngImage,
      }], { session }))
        .map((image) => image._id);

      postMetaList = (await PostMeta.insertMany([{
        postNo: 1,
        createdDate: commonTestData.dateList[0],
      }, {
        postNo: 2,
        createdDate: commonTestData.dateList[1],
      }, {
        postNo: 3,
        createdDate: commonTestData.dateList[2],
      }], { session }))
        .map((post) => post.toObject());

      seriesList = (await Series.insertMany([{
        ...commonTestData.series1,
        thumbnailImage: gifImageId,
        postMetaList: [postMetaList[0]],
      }, {
        ...commonTestData.series2,
        thumbnailImage: pngImageId,
        postMetaList: [postMetaList[1]],
      }], { session }));

      await PostMeta.updateOne({ postNo: 1 }, { series: seriesList[0]._id }, { session });
      await PostMeta.updateOne({ postNo: 3 }, { series: seriesList[1]._id }, { session });
      postMetaList = await PostMeta.find().session(session);
    });

    it('updateSeries - name: O, thumbnailContent: O, thumbnailImage: X, postToBeAddedList: O, postToBeRemovedList: O', async () => {
      const paramDto: UpdateSeriesRepoParamDto = {
        originalName: commonTestData.series1.name,
        seriesToBe: {
          name: commonTestData.series3.name,
          thumbnailContent: commonTestData.series3.thumbnailContent,
          postMetaIdToBeAddedList: [postMetaList[1]._id],
          postMetaIdToBeRemovedList: [postMetaList[0]._id],
        },
      };

      await seriesRepository.updateSeries(paramDto, session);

      const series1: (SeriesDoc | null) = await Series.findOne({ name: commonTestData.series1.name }).session(session).lean();
      (series1 === null).should.be.true;
      const series2: (SeriesDoc | null) = await Series.findOne({ name: commonTestData.series3.name }).session(session).lean();
      (series2 !== null).should.be.true;
      series2!.thumbnailContent.should.deep.equal(commonTestData.series3.thumbnailContent);
      series2!.thumbnailImage!.should.deep.equal(gifImageId);
      series2!.postMetaList.should.deep.equal([postMetaList[1]._id]);

      const postMeta1: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post1V1.postNo }).session(session).lean();
      (postMeta1!.series === null).should.be.true;

      const postMeta2: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post2V1.postNo }).session(session).lean();
      postMeta2!.series!.should.deep.equal(seriesList[0]._id);
    });

    it('updateSeries - with postToBeAddedList but one of them is already belong to another series', async () => {
      const paramDto: UpdateSeriesRepoParamDto = {
        originalName: commonTestData.series1.name,
        seriesToBe: {
          postMetaIdToBeAddedList: [postMetaList[2]._id],
          postMetaIdToBeRemovedList: [],
        },
      };

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.ALREADY_BELONG_TO_ANOTHER_SERIES, [postMetaList[2].postNo.toString(), commonTestData.series2.name]),
        async (_paramDto, _session) => seriesRepository.updateSeries(_paramDto, _session),
        paramDto,
        session,
      );
    });

    it('updateSeries - with postToBeRemovedList but one of them has not been allocated yet: no change', async () => {
      const paramDto: UpdateSeriesRepoParamDto = {
        originalName: commonTestData.series1.name,
        seriesToBe: {
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [postMetaList[1]._id],
        },
      };

      await seriesRepository.updateSeries(paramDto, session);
      const series: (SeriesDoc | null) = await Series.findOne({ name: commonTestData.series1.name }).session(session).lean();
      series!.postMetaList.should.deep.equal([postMetaList[0]._id]);
    });

    it('updateSeries - with empty parameter: no change', async () => {
      const paramDto: UpdateSeriesRepoParamDto = {
        originalName: commonTestData.series1.name,
        seriesToBe: {
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      };

      await seriesRepository.updateSeries(paramDto, session);
      const series1: (SeriesDoc | null) = await Series.findOne({ name: commonTestData.series1.name }).session(session).lean();
      (series1 !== null).should.be.true;
      series1!.thumbnailContent.should.deep.equal(commonTestData.series1.thumbnailContent);
      series1!.thumbnailImage!.should.deep.equal(gifImageId);
      series1!.postMetaList.should.deep.equal([postMetaList[0]._id]);
      const series2: (SeriesDoc | null) = await Series.findOne({ name: commonTestData.series2.name }).session(session).lean();
      series2!.postMetaList.should.deep.equal([postMetaList[1]._id]);
    });

    it('updateSeries - with inexistent series name', async () => {
      const inexistentName = 'Oh yeah oh shit 이런 건 처음 들어';
      const paramDto: UpdateSeriesRepoParamDto = {
        originalName: inexistentName,
        seriesToBe: {
          name: '쿵쿵쿵 옆집 사람들은 날 싫어해',
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      };

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.SERIES_NOT_FOUND, [inexistentName, 'name']),
        async (_paramDto, _session) => seriesRepository.updateSeries(_paramDto, _session),
        paramDto,
        session,
      );
    });
  });

  describe('deleteSeries test', () => {
    let testPost;
    let testSeries;

    beforeEach(async () => {
      [testSeries] = (await Series.insertMany([commonTestData.series1], { session })); // Spring

      [testPost] = (await PostMeta.insertMany([{
        postNo: 1,
        series: testSeries._id,
        createdDate: commonTestData.dateList[0],
      }], { session }));

      await Series.updateOne({ _id: testSeries._id }, { postMetaList: [testPost._id] }, { session });
    });

    it('deleteSeries', async () => {
      const paramDto: DeleteSeriesRepoParamDto = {
        name: commonTestData.series1.name,
      };

      await seriesRepository.deleteSeries(paramDto, session);

      const series: (SeriesDoc | null) = await Series.findOne({ name: commonTestData.series1.name }).session(session).lean();
      (series === null).should.be.true;

      const post: (PostMetaDoc | null) = await PostMeta.findOne({ _id: testPost._id }).session(session).lean();
      (post!.series === null).should.be.true;
    });
  });
});
