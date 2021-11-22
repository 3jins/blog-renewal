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
import { errorShouldBeThrown } from '@test/TestUtil';
import { Types } from 'mongoose';
import { SeriesDoc } from '@src/series/Series';

describe('SeriesService test', () => {
  let seriesService: SeriesService;
  let seriesRepository: SeriesRepository;
  let postMetaList: string[];
  let gifImageId: string;

  const {
    series2: { name: seriesName, thumbnailContent },
    objectIdList,
  } = commonTestData;

  before(() => {
    seriesRepository = spy(mock(SeriesRepository));
    seriesService = new SeriesService(instance(seriesRepository));
    postMetaList = objectIdList.slice(0, 2);
    [, , gifImageId] = objectIdList;
    should();
  });

  describe('findSeries test', () => {
    it('findSeries - with empty parameter', () => {
      const emptyParamDto: FindSeriesParamDto = {};
      seriesService.findSeries(emptyParamDto);
      verify(seriesRepository.findSeries(deepEqual<FindSeriesRepoParamDto>({}))).once();
    });

    it('findSeries - by name', () => {
      const nameOnlyParamDto: FindSeriesParamDto = {
        name: seriesName,
        isOnlyExactNameFound: true,
      };
      seriesService.findSeries(nameOnlyParamDto);
      verify(seriesRepository.findSeries(deepEqual<FindSeriesRepoParamDto>({
        name: seriesName,
        isOnlyExactNameFound: true,
      }))).once();
    });
  });

  describe('createSeries test', () => {
    it('series create test - with full parameters', async () => {
      const paramDto: CreateSeriesParamDto = {
        name: seriesName,
        thumbnailContent,
        thumbnailImage: gifImageId,
        postMetaIdList: postMetaList,
      };
      when(seriesRepository.findSeries(anything()))
        .thenResolve([{ name: seriesName } as SeriesDoc]);

      const result: string = await seriesService.createSeries(paramDto);

      const [repoParamDto] = capture<CreateSeriesRepoParamDto>(seriesRepository.createSeries).last();
      repoParamDto.name.should.equal(seriesName);
      repoParamDto.postMetaList.should.deep.equal(postMetaList.map((postMetaId) => new Types.ObjectId(postMetaId)));
      result.should.equal(seriesName);
    });

    it('series create test - with minimal parameters', async () => {
      const paramDto: CreateSeriesParamDto = {
        name: seriesName,
        thumbnailContent,
      };
      when(seriesRepository.findSeries(anything()))
        .thenResolve([{ name: seriesName } as SeriesDoc]);

      const result: string = await seriesService.createSeries(paramDto);

      const [repoParamDto] = capture<CreateSeriesRepoParamDto>(seriesRepository.createSeries).last();
      repoParamDto.name.should.equal(seriesName);
      repoParamDto.postMetaList.should.deep.equal([]);
      result.should.equal(seriesName);
    });

    it('series create test - when failed to create', async () => {
      const paramDto: CreateSeriesParamDto = {
        name: seriesName,
        thumbnailContent,
      };
      when(seriesRepository.findSeries(anything()))
        .thenResolve([]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_NOT_CREATED, [seriesName, 'name']),
        (_paramDto) => seriesService.createSeries(_paramDto),
        paramDto,
      );
    });
  });

  describe('updateSeries test', () => {
    it('series update test', async () => {
      const paramDto: UpdateSeriesParamDto = {
        originalName: seriesName,
        seriesToBe: {
          name: '돈 명예 평화 야\'망 사\'랑 또 뭐가 있더라',
          thumbnailContent,
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
      verify(seriesRepository.updateSeries(deepEqual(repoParamDto))).once();
    });

    it('series update test - minimal seriesToBe', async () => {
      const paramDto: UpdateSeriesParamDto = {
        originalName: seriesName,
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
        originalName: seriesName,
        seriesToBe: {
          name: commonTestData.simpleText,
        },
      };

      await seriesService.updateSeries(paramDto);
      verify(seriesRepository.updateSeries(deepEqual({
        originalName: seriesName,
        seriesToBe: {
          name: commonTestData.simpleText,
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      })));
    });
  });

  describe('deleteSeries test', () => {
    it('series delete test', async () => {
      const paramDto: DeleteSeriesParamDto = {
        name: seriesName,
      };
      await seriesService.deleteSeries(paramDto);

      const repoParamDto: DeleteSeriesRepoParamDto = { ...paramDto };
      verify(seriesRepository.deleteSeries(deepEqual(repoParamDto))).once();
    });
  });
});
