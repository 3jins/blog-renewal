import _ from 'lodash';
import Router from '@koa/router';
import koaBody from 'koa-body';
import { Context } from 'koa';
import Container from 'typedi';
import * as http2 from 'http2';
import { File } from 'formidable';
import * as URL from '@src/common/constant/URL';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import PostService from '@src/post/PostService';
import BlogError from '@src/common/error/BlogError';
import {
  AddUpdatedVersionPostRequestDto,
  AddUpdatedVersionPostRequestSchema,
  CreateNewPostRequestDto,
  CreateNewPostRequestSchema,
  FindPostRequestDto,
  FindPostRequestSchema,
  UpdatePostMetaDataRequestDto,
  UpdatePostMetaDataRequestSchema,
} from '@src/post/dto/PostRequestDto';
import { fileTypeSchema } from '@src/common/validation/ObjectTypeSchema';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { FindPostResponseDto } from '@src/post/dto/PostResponseDto';
import { FindPostParamDto } from '@src/post/dto/PostParamDto';
import { mapFindPostRequestDtoToFindPostParamDto } from '@src/post/dto/PostDtoMapper';
import HttpHeaderField from '@src/common/constant/HttpHeaderField';

const postRouter = new Router();
const koaBodyOptions = {
  multipart: true,
};
const postService: PostService = Container.get(PostService);

postRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo*`, (ctx: Context) => {
  const { postNo } = ctx.params;
  const requestDto: FindPostRequestDto = getValidatedRequestDtoOf(FindPostRequestSchema, { ...ctx.query, postNo });
  const paramDto: FindPostParamDto = mapFindPostRequestDtoToFindPostParamDto(requestDto);

  postService.findPost(paramDto)
    .then((response: FindPostResponseDto) => {
      ctx.body = response;
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

postRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`, koaBody(koaBodyOptions), (ctx: Context) => {
  if (_.isEmpty(ctx.request.files)) {
    throw new BlogError(BlogErrorCode.FILE_NOT_UPLOADED);
  }

  const requestDto: CreateNewPostRequestDto = getValidatedRequestDtoOf(CreateNewPostRequestSchema, ctx.request.body);
  const post: File = getValidatedRequestDtoOf(fileTypeSchema, ctx.request.files!.post) as File;

  postService.createNewPost({ ...requestDto, post })
    .then((postNo: number) => {
      ctx.set(HttpHeaderField.CONTENT_LOCATION, `${URL.PREFIX.API}${URL.ENDPOINT.POST}/${postNo}`);
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

postRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`, koaBody(koaBodyOptions), (ctx: Context) => {
  if (_.isEmpty(ctx.request.files)) {
    throw new BlogError(BlogErrorCode.FILE_NOT_UPLOADED);
  }

  const requestDto: AddUpdatedVersionPostRequestDto = getValidatedRequestDtoOf(AddUpdatedVersionPostRequestSchema, ctx.request.body);
  const post: File = getValidatedRequestDtoOf(fileTypeSchema, ctx.request.files!.post) as File;

  postService.addUpdatedVersionPost({ ...requestDto, post })
    .then((postVersionId: string) => {
      ctx.set(HttpHeaderField.CONTENT_LOCATION, `${URL.PREFIX.API}${URL.ENDPOINT.POST}/${requestDto.postNo}?postVersionId=${postVersionId}`);
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

postRouter.patch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`, koaBody(koaBodyOptions), (ctx: Context) => {
  const requestDto: UpdatePostMetaDataRequestDto = getValidatedRequestDtoOf(UpdatePostMetaDataRequestSchema, ctx.request.body);

  postService.updatePostMetaData({ ...requestDto })
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default postRouter;
