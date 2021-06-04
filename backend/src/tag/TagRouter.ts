import Router from '@koa/router';
import { Context } from 'koa';
import Container from 'typedi';
import Ajv from 'ajv';
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
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import * as URL from '../common/constant/URL';
import TagService from './TagService';

const tagRouter = new Router();
const tagService: TagService = Container.get(TagService);
const ajv = new Ajv({ coerceTypes: true });

tagRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, (ctx: Context) => {
  const requestDto: FindTagRequestDto = ctx.query;
  const validate = ajv.compile(FindTagRequestSchema);
  if (!validate(requestDto)) {
    throw new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, [JSON.stringify(requestDto)], JSON.stringify(validate.errors));
  }

  tagService.findTag(requestDto)
    .then((tags) => {
      ctx.body = tags;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

tagRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, (ctx: Context) => {
  const requestDto: CreateTagRequestDto = ctx.request.body;
  const validate = ajv.compile(CreateTagRequestSchema);
  if (!validate(requestDto)) {
    throw new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, [JSON.stringify(requestDto)], JSON.stringify(validate.errors));
  }

  tagService.createTag(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

tagRouter.patch(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, (ctx: Context) => {
  const requestDto: UpdateTagRequestDto = ctx.request.body;
  const validate = ajv.compile(UpdateTagRequestSchema);
  if (!validate(requestDto)) {
    throw new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, [JSON.stringify(requestDto)], JSON.stringify(validate.errors));
  }

  tagService.updateTag(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

tagRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}/:name`, (ctx: Context) => {
  const requestDto: DeleteTagRequestDto = ctx.params;
  const validate = ajv.compile(DeleteTagRequestSchema);
  if (!validate(requestDto)) {
    throw new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, [JSON.stringify(requestDto)], JSON.stringify(validate.errors));
  }

  tagService.deleteTag(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default tagRouter;
