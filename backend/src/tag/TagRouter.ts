import Router from '@koa/router';
import { Context } from 'koa';
import Container from 'typedi';
import {
  CreateTagRequestDto,
  CreateTagRequestSchema,
  DeleteTagRequestDto,
  DeleteTagRequestSchema,
  FindTagRequestDto,
  FindTagRequestSchema,
  UpdateTagRequestDto,
  UpdateTagRequestSchema,
} from '@src/tag/dto/TagRequestDto';
import * as http2 from 'http2';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import * as URL from '@common/constant/URL';
import HttpHeaderField from '@common/constant/HttpHeaderField';
import TagService from './TagService';
import { FindTagResponseDto } from '@src/tag/dto/TagResponseDto';

const tagRouter = new Router();
const tagService: TagService = Container.get(TagService);

tagRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}/:name*`, (ctx: Context) => {
  const { name } = ctx.params;
  const requestDto: FindTagRequestDto = getValidatedRequestDtoOf(FindTagRequestSchema, { ...ctx.query, name });

  return tagService.findTag(requestDto)
    .then((responseDto: FindTagResponseDto) => {
      ctx.body = responseDto;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

tagRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, (ctx: Context) => {
  const requestDto: CreateTagRequestDto = getValidatedRequestDtoOf(CreateTagRequestSchema, ctx.request.body);

  return tagService.createTag(requestDto)
    .then((name) => {
      ctx.set(HttpHeaderField.CONTENT_LOCATION, `${ctx.url}/${encodeURI(name)}`);
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

tagRouter.patch(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, (ctx: Context) => {
  const requestDto: UpdateTagRequestDto = getValidatedRequestDtoOf(UpdateTagRequestSchema, ctx.request.body);

  tagService.updateTag(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

tagRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}/:name`, (ctx: Context) => {
  const requestDto: DeleteTagRequestDto = getValidatedRequestDtoOf(DeleteTagRequestSchema, ctx.params);

  tagService.deleteTag(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default tagRouter;
