import _ from 'lodash';
import Router from '@koa/router';
import koaBody from 'koa-body';
import { Context } from 'koa';
import Container from 'typedi';
import * as http2 from 'http2';
import { File } from 'formidable';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import PostService from '@src/post/PostService';
import BlogError from '@src/common/error/BlogError';
import {
  AddUpdatedVersionPostRequestDto,
  AddUpdatedVersionPostRequestSchema,
  CreateNewPostRequestDto,
  CreateNewPostRequestSchema,
  DeletePostRequestDto,
  DeletePostRequestSchema,
  DeletePostVersionRequestDto,
  DeletePostVersionRequestSchema,
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
import * as URL from '@common/constant/URL';
import HttpHeaderField from '@common/constant/HttpHeaderField';

const postRouter = new Router();
const koaBodyOptions = {
  multipart: true,
};
const postService: PostService = Container.get(PostService);

postRouter.get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo*`, (ctx: Context) => {
  const { postNo } = ctx.params;
  const requestDto: FindPostRequestDto = getValidatedRequestDtoOf(FindPostRequestSchema, { ...ctx.query, postNo });
  const paramDto: FindPostParamDto = mapFindPostRequestDtoToFindPostParamDto(requestDto);

  return postService.findPost(paramDto)
    .then((response: FindPostResponseDto) => {
      ctx.body = _.isNil(postNo) ? response : response.postList[0];
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

postRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`, koaBody(koaBodyOptions), (ctx: Context) => {
  if (_.isEmpty(ctx.request.files)) {
    throw new BlogError(BlogErrorCode.FILE_NOT_UPLOADED);
  }

  const requestDto: CreateNewPostRequestDto = getValidatedRequestDtoOf(CreateNewPostRequestSchema, ctx.request.body);
  const post: File = getValidatedRequestDtoOf(fileTypeSchema, ctx.request.files!.post) as File;

  return postService.createNewPost({ ...requestDto, post })
    .then((postNo: number) => {
      ctx.set(HttpHeaderField.CONTENT_LOCATION, `${URL.PREFIX.API}${URL.ENDPOINT.POST}/${postNo}`);
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
      ctx.body = postNo;
    });
});

postRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`, koaBody(koaBodyOptions), (ctx: Context) => {
  if (_.isEmpty(ctx.request.files)) {
    throw new BlogError(BlogErrorCode.FILE_NOT_UPLOADED);
  }

  const requestDto: AddUpdatedVersionPostRequestDto = getValidatedRequestDtoOf(AddUpdatedVersionPostRequestSchema, ctx.request.body);
  const post: File = getValidatedRequestDtoOf(fileTypeSchema, ctx.request.files!.post) as File;

  return postService.addUpdatedVersionPost({ ...requestDto, post })
    .then((postVersionId: string) => {
      ctx.set(HttpHeaderField.CONTENT_LOCATION, `${URL.PREFIX.API}${URL.ENDPOINT.POST}/${requestDto.postNo}?postVersionId=${postVersionId}`);
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

postRouter.patch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo`, koaBody(koaBodyOptions), (ctx: Context) => {
  const { postNo } = ctx.params;
  const requestDto: UpdatePostMetaDataRequestDto = getValidatedRequestDtoOf(UpdatePostMetaDataRequestSchema, { postNo, ...ctx.request.body });

  return postService.updatePostMetaData({ ...requestDto })
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

postRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}/:postVersionId`, (ctx: Context) => {
  const requestDto: DeletePostVersionRequestDto = getValidatedRequestDtoOf(DeletePostVersionRequestSchema, ctx.params);

  return postService.deletePostVersion({ ...requestDto })
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

postRouter.delete(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo`, (ctx: Context) => {
  const requestDto: DeletePostRequestDto = getValidatedRequestDtoOf(DeletePostRequestSchema, ctx.params);

  postService.deletePost({ ...requestDto })
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_OK;
    });
});

export default postRouter;
