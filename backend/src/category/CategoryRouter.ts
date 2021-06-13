import Router from '@koa/router';
import { Context } from 'koa';
import Container from 'typedi';
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
import * as http2 from 'http2';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import * as URL from '../common/constant/URL';
import CategoryService from './CategoryService';

const categoryRouter = new Router();
const categoryService: CategoryService = Container.get(CategoryService);

categoryRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, (ctx: Context) => {
  const requestDto: FindCategoryRequestDto = getValidatedRequestDtoOf(FindCategoryRequestSchema, ctx.query);

  categoryService.findCategory(requestDto)
    .then((categorys) => {
      ctx.body = categorys;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

categoryRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, (ctx: Context) => {
  const requestDto: CreateCategoryRequestDto = getValidatedRequestDtoOf(CreateCategoryRequestSchema, ctx.request.body);

  categoryService.createCategory(requestDto)
    .then(() => {
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

categoryRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:categoryNo`, (ctx: Context) => {
  const requestDto: DeleteCategoryRequestDto = getValidatedRequestDtoOf(DeleteCategoryRequestSchema, ctx.params);

  categoryService.deleteCategory(requestDto)
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default categoryRouter;
