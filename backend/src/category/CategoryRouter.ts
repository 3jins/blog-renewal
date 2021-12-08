import Router from '@koa/router';
import { Context } from 'koa';
import Container from 'typedi';
import * as http2 from 'http2';
import {
  CreateCategoryRequestDto,
  CreateCategoryRequestSchema,
  DeleteCategoryRequestDto,
  DeleteCategoryRequestSchema,
  FindCategoryRequestDto,
  FindCategoryRequestSchema,
  UpdateCategoryRequestDto,
  UpdateCategoryRequestSchema,
} from '@src/category/dto/CategoryRequestDto';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import HttpHeaderField from '@src/common/constant/HttpHeaderField';
import * as URL from '../common/constant/URL';
import CategoryService from './CategoryService';

const categoryRouter = new Router();
const categoryService: CategoryService = Container.get(CategoryService);

categoryRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:name*`, (ctx: Context) => {
  const { name } = ctx.params;
  const requestDto: FindCategoryRequestDto = getValidatedRequestDtoOf(FindCategoryRequestSchema, { ...ctx.query, name });

  categoryService.findCategory(requestDto)
    .then((categories) => {
      ctx.body = categories;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

categoryRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, (ctx: Context) => {
  const requestDto: CreateCategoryRequestDto = getValidatedRequestDtoOf(CreateCategoryRequestSchema, ctx.request.body);

  categoryService.createCategory(requestDto)
    .then((name) => {
      ctx.set(HttpHeaderField.CONTENT_LOCATION, `${ctx.url}/${encodeURI(name)}`);
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

categoryRouter.patch(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, (ctx: Context) => {
  const requestDto: UpdateCategoryRequestDto = getValidatedRequestDtoOf(UpdateCategoryRequestSchema, ctx.request.body);

  categoryService.updateCategory(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

categoryRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:name`, (ctx: Context) => {
  const requestDto: DeleteCategoryRequestDto = getValidatedRequestDtoOf(DeleteCategoryRequestSchema, ctx.params);

  categoryService.deleteCategory(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default categoryRouter;
