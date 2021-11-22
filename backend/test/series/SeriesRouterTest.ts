import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { anything, deepEqual, instance, mock, reset, verify, when } from 'ts-mockito';
import { Container } from 'typedi';
import { endApp, startApp } from '@src/app';
import * as URL from '@src/common/constant/URL';
import SeriesService from '@src/series/SeriesService';
import {
  CreateSeriesRequestDto,
  DeleteSeriesRequestDto,
  FindSeriesRequestDto,
  UpdateSeriesRequestDto,
} from '@src/series/dto/SeriesRequestDto';
import { CreateSeriesParamDto, FindSeriesParamDto, UpdateSeriesParamDto } from '@src/series/dto/SeriesParamDto';
import { common as commonTestData } from '@test/data/testData';
import * as http2 from 'http2';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import HttpHeaderField from '@src/common/constant/HttpHeaderField';

const seriesService: SeriesService = mock(SeriesService);
Container.set(SeriesService, instance(seriesService));
delete require.cache[require.resolve('@src/series/SeriesRouter')];
const SeriesRouter = require('@src/series/SeriesRouter');

describe('Series router test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  const { series2: { name: seriesName, thumbnailContent }, postMetaIdList } = commonTestData;

  before(() => {
    should();
    server = startApp([SeriesRouter.default]);
    request = supertest(server);
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`GET ${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/:name`, () => {
    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/:name - normal case`, async () => {
      const requestDto: FindSeriesRequestDto = {
        isOnlyExactNameFound: true,
      };
      const paramDto: FindSeriesParamDto = { ...requestDto };

      when(seriesService.findSeries(anything()))
        .thenResolve([]);

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/${encodeURI(seriesName)}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(seriesService.findSeries(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - normal case`, async () => {
      const requestDto: FindSeriesRequestDto = {
        isOnlyExactNameFound: true,
      };
      const paramDto: FindSeriesParamDto = { ...requestDto };

      when(seriesService.findSeries(anything()))
        .thenResolve([]);

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(seriesService.findSeries(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/:name - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/${encodeURI(seriesName)}`)
        .query(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/:name - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = {
        isOnlyExactNameFound: 'hello',
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/${encodeURI(seriesName)}`)
        .query(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`POST ${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`, () => {
    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - normal case`, async () => {
      const url = `${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`;
      const requestDto: CreateSeriesRequestDto = { name: seriesName, thumbnailContent, postMetaIdList };
      const paramDto: CreateSeriesParamDto = { ...requestDto };

      when(seriesService.createSeries(anything()))
        .thenResolve(seriesName);

      await request
        .post(url)
        .send(requestDto)
        .expect(201)
        .expect((res) => res.get(HttpHeaderField.CONTENT_LOCATION).should.equal(`${url}/${encodeURI(seriesName)}`));
      verify(seriesService.createSeries(deepEqual<CreateSeriesParamDto>(paramDto))).once();
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`)
        .send(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (res.get(HttpHeaderField.CONTENT_LOCATION) === undefined).should.be.true;
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = { name: seriesName, postMetaIdList: true };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`)
        .send(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (res.get(HttpHeaderField.CONTENT_LOCATION) === undefined).should.be.true;
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`, () => {
    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - normal case`, async () => {
      const requestDto: UpdateSeriesRequestDto = {
        originalName: seriesName,
        seriesToBe: {
          name: '돈 명예 평화 야\'망 사\'랑 또 뭐가 있더라',
          postMetaIdToBeAddedList: postMetaIdList.slice(0, 2),
          postMetaIdToBeRemovedList: postMetaIdList.slice(2, 1),
        },
      };
      const paramDto: UpdateSeriesParamDto = { ...requestDto };

      when(seriesService.updateSeries(anything()))
        .thenResolve();

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`)
        .send(requestDto)
        .expect(200);
      verify(seriesService.updateSeries(deepEqual<UpdateSeriesRequestDto>(paramDto))).once();
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`)
        .send(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = { name: seriesName, postMetaIdList: [true, false] };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`)
        .send(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`, () => {
    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - normal case`, async () => {
      when(seriesService.deleteSeries(anything()))
        .thenResolve();

      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/${encodeURI(seriesName)}`)
        .expect(200);
      verify(seriesService.deleteSeries(deepEqual<DeleteSeriesRequestDto>({ name: seriesName }))).once();
    });

    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.SERIES} - parameter error(parameter not passed)`, async () => {
      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`)
        .expect(http2.constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  after(() => {
    endApp(server);
    reset(seriesService);
  });
});
