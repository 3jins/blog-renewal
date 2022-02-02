import Router from '@koa/router';
import { Context } from 'koa';
import Container from 'typedi';
import * as http2 from 'http2';
import {
  CreateSeriesRequestDto,
  CreateSeriesRequestSchema,
  DeleteSeriesRequestDto,
  DeleteSeriesRequestSchema,
  FindSeriesRequestDto,
  FindSeriesRequestSchema,
  UpdateSeriesRequestDto,
  UpdateSeriesRequestSchema,
} from '@src/series/dto/SeriesRequestDto';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import SeriesService from '@src/series/SeriesService';
import { FindSeriesResponseDto } from '@src/series/dto/SeriesResponseDto';
import * as URL from '@common/constant/URL';
import HttpHeaderField from '@common/constant/HttpHeaderField';

const seriesRouter = new Router();
const seriesService: SeriesService = Container.get(SeriesService);

seriesRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/:name*`, (ctx: Context) => {
  const { name } = ctx.params;
  const requestDto: FindSeriesRequestDto = getValidatedRequestDtoOf(FindSeriesRequestSchema, { ...ctx.query, name });

  return seriesService.findSeries(requestDto)
    .then((responseDto: FindSeriesResponseDto) => {
      ctx.body = responseDto;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

seriesRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`, (ctx: Context) => {
  const requestDto: CreateSeriesRequestDto = getValidatedRequestDtoOf(CreateSeriesRequestSchema, ctx.request.body);

  return seriesService.createSeries(requestDto)
    .then((name) => {
      ctx.set(HttpHeaderField.CONTENT_LOCATION, `${ctx.url}/${encodeURI(name)}`);
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

seriesRouter.patch(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`, (ctx: Context) => {
  const requestDto: UpdateSeriesRequestDto = getValidatedRequestDtoOf(UpdateSeriesRequestSchema, ctx.request.body);

  return seriesService.updateSeries(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

seriesRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/:name`, (ctx: Context) => {
  const requestDto: DeleteSeriesRequestDto = getValidatedRequestDtoOf(DeleteSeriesRequestSchema, ctx.params);

  return seriesService.deleteSeries(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default seriesRouter;
