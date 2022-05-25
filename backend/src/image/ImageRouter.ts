import * as http2 from 'http2';
import Router from '@koa/router';
import { Context } from 'koa';
import Container from 'typedi';
import _ from 'lodash';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import ImageService from '@src/image/ImageService';
import BlogError from '@src/common/error/BlogError';
import * as URL from '@common/constant/URL';

const imageRouter = new Router();
const imageService: ImageService = Container.get(ImageService);

imageRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.IMAGE}`, (ctx: Context) => {
  if (_.isEmpty(ctx.request.files)) {
    throw new BlogError(BlogErrorCode.FILE_NOT_UPLOADED);
  }
  imageService.uploadImage({ files: ctx.request.files! })
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

export default imageRouter;
