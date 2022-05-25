import _ from 'lodash';
import Router from '@koa/router';
import { Context } from 'koa';
import Container from 'typedi';
import * as http2 from 'http2';
import { File } from 'formidable';
import * as URL from '@common/constant/URL';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import PostService from '@src/post/PostService';
import { fileTypeSchema } from '@src/common/validation/ObjectTypeSchema';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

const postPreviewRouter = new Router();
const postService: PostService = Container.get(PostService);

postPreviewRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT['POST-PREVIEW']}`, async (ctx: Context) => {
  // TODO: Change to use GET when this issue of Axios is solved: https://github.com/axios/axios/issues/787
  if (_.isEmpty(ctx.request.files)) {
    throw new BlogError(BlogErrorCode.FILE_NOT_UPLOADED);
  }

  const post: File = getValidatedRequestDtoOf(fileTypeSchema, ctx.request.files!.post) as File;

  ctx.body = postService.getPostPreview({ post });
  ctx.status = http2.constants.HTTP_STATUS_OK;
});

export default postPreviewRouter;
