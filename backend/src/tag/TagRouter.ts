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
import * as URL from '@src/common/constant/URL';
import HttpHeaderField from '@src/common/constant/HttpHeaderField';
import TagService from './TagService';

const tagRouter = new Router();
const tagService: TagService = Container.get(TagService);

tagRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}/:name*`, (ctx: Context) => {
  const { name } = ctx.params;
  const requestDto: FindTagRequestDto = getValidatedRequestDtoOf(FindTagRequestSchema, { ...ctx.query, name });

  tagService.findTag(requestDto)
    .then((tags) => {
      ctx.body = tags;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

tagRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, (ctx: Context) => {
  const requestDto: CreateTagRequestDto = getValidatedRequestDtoOf(CreateTagRequestSchema, ctx.request.body);

  tagService.createTag(requestDto)
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
