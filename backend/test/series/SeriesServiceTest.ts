import { should } from 'chai';
import { anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import SeriesService from '@src/series/SeriesService';
import SeriesRepository from '@src/series/SeriesRepository';
import {
  CreateSeriesParamDto,
  DeleteSeriesParamDto,
  FindSeriesParamDto,
  UpdateSeriesParamDto,
} from '@src/series/dto/SeriesParamDto';
import {
  CreateSeriesRepoParamDto,
  DeleteSeriesRepoParamDto,
  FindSeriesRepoParamDto,
  UpdateSeriesRepoParamDto,
} from '@src/series/dto/SeriesRepoParamDto';
import { common as commonTestData } from '@test/data/testData';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { abortTestTransaction, errorShouldBeThrown, replaceUseTransactionForTest } from '@test/TestUtil';
import { ClientSession, Connection, PopulatedDoc, Types } from 'mongoose';
import { SeriesDoc } from '@src/series/Series';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import sinon from 'sinon';
import { ImageDoc } from '@src/image/Image';
import { PostMetaDoc } from '@src/post/model/PostMeta';
import { FindSeriesResponseDto } from '@src/series/dto/SeriesResponseDto';

describe('SeriesService test', () => {
  let sandbox;
  let conn: Connection;
  let session: ClientSession;
  let seriesService: SeriesService;
  let seriesRepository: SeriesRepository;
  let postMetaList: string[];
  let gifImageId: string;

  const {
    series1: { name: seriesName1, thumbnailContent: thumbnailContent1 },
    series2: { name: seriesName2, thumbnailContent: thumbnailContent2 },
    objectIdList,
  } = commonTestData;

  before(() => {
    seriesRepository = spy(mock(SeriesRepository));
    seriesService = new SeriesService(instance(seriesRepository));
    postMetaList = objectIdList.slice(0, 2);
    [, , gifImageId] = objectIdList;
    should();
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

  describe('findSeries test', () => {
    it('findSeries - with empty parameter', async () => {
      const emptyParamDto: FindSeriesParamDto = {};
      when(seriesRepository.findSeries(anything(), anything()))
        .thenResolve([]);

      await seriesService.findSeries(emptyParamDto);
      verify(seriesRepository.findSeries(deepEqual<FindSeriesRepoParamDto>({}), anything())).once();
    });

    it('findSeries - by name', async () => {
      const nameOnlyParamDto: FindSeriesParamDto = {
        name: seriesName2,
        isOnlyExactNameFound: true,
      };
      when(seriesRepository.findSeries(anything(), anything()))
        .thenResolve([]);

      await seriesService.findSeries(nameOnlyParamDto);
      verify(seriesRepository.findSeries(deepEqual<FindSeriesRepoParamDto>({
        name: seriesName2,
        isOnlyExactNameFound: true,
      }), anything())).once();
    });

    it('findSeries - response mapping test', async () => {
      const { gifImage, postMeta1, postMeta3 } = commonTestData;
      const paramDto: FindSeriesParamDto = {};
      when(seriesRepository.findSeries(anything(), anything()))
        .thenResolve([{
          name: seriesName1,
          thumbnailContent: thumbnailContent1,
          thumbnailImage: gifImage,
          postMetaList: [postMeta1, postMeta3],
        } as SeriesDoc, {
          name: seriesName1,
          thumbnailContent: thumbnailContent1,
          postMetaList: [] as PostMetaDoc[],
        } as SeriesDoc]);

      const responseDto: FindSeriesResponseDto = await seriesService.findSeries(paramDto);
      responseDto.seriesList.should.have.lengthOf(2);
      responseDto.seriesList[0].name.should.equal(seriesName1);
      responseDto.seriesList[0].thumbnailContent.should.equal(thumbnailContent1);
      responseDto.seriesList[0].thumbnailImage!.title.should.equal(gifImage.title);
      responseDto.seriesList[0].thumbnailImage!.createdDate.should.equal(gifImage.createdDate);
      responseDto.seriesList[0].thumbnailImage!.size.should.equal(gifImage.size);
      responseDto.seriesList[0].postList.should.have.lengthOf(2);
      responseDto.seriesList[0].postList[0].postNo.should.equal(postMeta1.postNo);
      responseDto.seriesList[0].postList[0].createdDate.should.equal(postMeta1.createdDate);
      responseDto.seriesList[0].postList[0].isDeleted.should.equal(postMeta1.isDeleted);
      responseDto.seriesList[0].postList[0].commentCount.should.equal(postMeta1.commentCount);
      responseDto.seriesList[0].postList[0].isPrivate.should.equal(postMeta1.isPrivate);
      responseDto.seriesList[0].postList[0].isDeprecated.should.equal(postMeta1.isDeprecated);
      responseDto.seriesList[0].postList[0].isDraft.should.equal(postMeta1.isDraft);
      responseDto.seriesList[0].postList[1].postNo.should.equal(postMeta3.postNo);
      responseDto.seriesList[0].postList[1].createdDate.should.equal(postMeta3.createdDate);
      responseDto.seriesList[0].postList[1].isDeleted.should.equal(postMeta3.isDeleted);
      responseDto.seriesList[0].postList[1].commentCount.should.equal(postMeta3.commentCount);
      responseDto.seriesList[0].postList[1].isPrivate.should.equal(postMeta3.isPrivate);
      responseDto.seriesList[0].postList[1].isDeprecated.should.equal(postMeta3.isDeprecated);
      responseDto.seriesList[0].postList[1].isDraft.should.equal(postMeta3.isDraft);
      responseDto.seriesList[1].name.should.equal(seriesName1);
      responseDto.seriesList[1].thumbnailContent.should.equal(thumbnailContent1);
      (responseDto.seriesList[1].thumbnailImage === undefined).should.be.true;
      responseDto.seriesList[1].postList.should.have.lengthOf(0);
    });
  });

  describe('createSeries test', () => {
    it('series create test - with full parameters', async () => {
      const paramDto: CreateSeriesParamDto = {
        name: seriesName2,
        thumbnailContent: thumbnailContent2,
        thumbnailImage: gifImageId,
        postMetaIdList: postMetaList,
      };
      when(seriesRepository.findSeries(anything(), anything()))
        .thenResolve([{ name: seriesName2 } as SeriesDoc]);

      const result: string = await seriesService.createSeries(paramDto);

      const [repoParamDto] = capture<CreateSeriesRepoParamDto, ClientSession>(seriesRepository.createSeries).last();
      repoParamDto.name.should.equal(seriesName2);
      repoParamDto.postMetaList.should.deep.equal(postMetaList.map((postMetaId) => new Types.ObjectId(postMetaId)));
      result.should.equal(seriesName2);
    });

    it('series create test - with minimal parameters', async () => {
      const paramDto: CreateSeriesParamDto = {
        name: seriesName2,
        thumbnailContent: thumbnailContent2,
      };
      when(seriesRepository.findSeries(anything(), anything()))
        .thenResolve([{ name: seriesName2 } as SeriesDoc]);

      const result: string = await seriesService.createSeries(paramDto);

      const [repoParamDto] = capture<CreateSeriesRepoParamDto, ClientSession>(seriesRepository.createSeries).last();
      repoParamDto.name.should.equal(seriesName2);
      repoParamDto.postMetaList.should.deep.equal([]);
      result.should.equal(seriesName2);
    });

    it('series create test - when failed to create', async () => {
      const paramDto: CreateSeriesParamDto = {
        name: seriesName2,
        thumbnailContent: thumbnailContent2,
      };
      when(seriesRepository.findSeries(anything(), anything()))
        .thenResolve([]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_NOT_CREATED, [seriesName2, 'name']),
        (_paramDto) => seriesService.createSeries(_paramDto),
        paramDto,
      );
    });
  });

  describe('updateSeries test', () => {
    it('series update test', async () => {
      const paramDto: UpdateSeriesParamDto = {
        originalName: seriesName2,
        seriesToBe: {
          name: '돈 명예 평화 야\'망 사\'랑 또 뭐가 있더라',
          thumbnailContent: thumbnailContent2,
          thumbnailImage: gifImageId,
          postMetaIdToBeAddedList: [postMetaList[0]],
          postMetaIdToBeRemovedList: [postMetaList[1]],
        },
      };
      await seriesService.updateSeries(paramDto);

      const repoParamDto: UpdateSeriesRepoParamDto = {
        ...paramDto,
        seriesToBe: {
          ...paramDto.seriesToBe,
          postMetaIdToBeAddedList: paramDto.seriesToBe.postMetaIdToBeAddedList!,
          postMetaIdToBeRemovedList: paramDto.seriesToBe.postMetaIdToBeRemovedList!,
        },
      };
      verify(seriesRepository.updateSeries(deepEqual(repoParamDto), anything())).once();
    });

    it('series update test - minimal seriesToBe', async () => {
      const paramDto: UpdateSeriesParamDto = {
        originalName: seriesName2,
        seriesToBe: {},
      };
      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.PARAMETER_EMPTY),
        async (_paramDto) => seriesService.updateSeries(_paramDto),
        paramDto,
      );
    });

    it('series update test - without postMetaIdToBeAddedList and postMetaIdToBeRemovedList', async () => {
      const paramDto: UpdateSeriesParamDto = {
        originalName: seriesName2,
        seriesToBe: {
          name: commonTestData.simpleTexts[0],
        },
      };

      await seriesService.updateSeries(paramDto);
      verify(seriesRepository.updateSeries(deepEqual({
        originalName: seriesName2,
        seriesToBe: {
          name: commonTestData.simpleTexts[0],
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      }), anything()));
    });
  });

  describe('deleteSeries test', () => {
    it('series delete test', async () => {
      const paramDto: DeleteSeriesParamDto = {
        name: seriesName2,
      };
      await seriesService.deleteSeries(paramDto);

      const repoParamDto: DeleteSeriesRepoParamDto = { ...paramDto };
      verify(seriesRepository.deleteSeries(deepEqual(repoParamDto), anything())).once();
    });
  });
});
