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
import HttpHeaderField from '@common/constant/HttpHeaderField';
import * as URL from '@common/constant/URL';
import CategoryService from '@src/category/CategoryService';
import { FindCategoryResponseDto } from '@src/category/dto/CategoryResponseDto';

const categoryRouter = new Router();
const categoryService: CategoryService = Container.get(CategoryService);

categoryRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:name*`, (ctx: Context) => {
  const { name } = ctx.params;
  const requestDto: FindCategoryRequestDto = getValidatedRequestDtoOf(FindCategoryRequestSchema, { ...ctx.query, name });

  return categoryService.findCategory(requestDto)
    .then((responseDto: FindCategoryResponseDto) => {
      ctx.body = responseDto;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

categoryRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, (ctx: Context) => {
  const requestDto: CreateCategoryRequestDto = getValidatedRequestDtoOf(CreateCategoryRequestSchema, ctx.request.body);

  return categoryService.createCategory(requestDto)
    .then((name: string) => {
      ctx.body = name;
      ctx.set(HttpHeaderField.CONTENT_LOCATION, `${ctx.url}/${encodeURI(name)}`);
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

categoryRouter.patch(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, (ctx: Context) => {
  const requestDto: UpdateCategoryRequestDto = getValidatedRequestDtoOf(UpdateCategoryRequestSchema, ctx.request.body);

  return categoryService.updateCategory(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

categoryRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:name`, (ctx: Context) => {
  const requestDto: DeleteCategoryRequestDto = getValidatedRequestDtoOf(DeleteCategoryRequestSchema, ctx.params);

  return categoryService.deleteCategory(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default categoryRouter;
