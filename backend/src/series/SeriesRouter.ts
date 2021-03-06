import Router from '@koa/router';
import { Context } from 'koa';
import Container from 'typedi';
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
import * as http2 from 'http2';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import * as URL from '../common/constant/URL';
import SeriesService from './SeriesService';

const seriesRouter = new Router();
const seriesService: SeriesService = Container.get(SeriesService);

seriesRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`, (ctx: Context) => {
  const requestDto: FindSeriesRequestDto = getValidatedRequestDtoOf(FindSeriesRequestSchema, ctx.query);

  seriesService.findSeries(requestDto)
    .then((series) => {
      ctx.body = series;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

seriesRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`, (ctx: Context) => {
  const requestDto: CreateSeriesRequestDto = getValidatedRequestDtoOf(CreateSeriesRequestSchema, ctx.request.body);

  seriesService.createSeries(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

seriesRouter.patch(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`, (ctx: Context) => {
  const requestDto: UpdateSeriesRequestDto = getValidatedRequestDtoOf(UpdateSeriesRequestSchema, ctx.request.body);

  seriesService.updateSeries(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

seriesRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/:name`, (ctx: Context) => {
  const requestDto: DeleteSeriesRequestDto = getValidatedRequestDtoOf(DeleteSeriesRequestSchema, ctx.params);

  seriesService.deleteSeries(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default seriesRouter;
