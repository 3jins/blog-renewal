import * as http2 from 'http2';
import Router from '@koa/router';
import koaBody from 'koa-body';
import { Context } from 'koa';
import Container from 'typedi';
import _ from 'lodash';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import * as URL from '../common/constant/URL';
import ImageService from './ImageService';
import BlogError from '@src/common/error/BlogError';

const imageRouter = new Router();
const koaBodyOptions = {
  multipart: true,
};
const imageService: ImageService = Container.get(ImageService);

imageRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.IMAGE}`, koaBody(koaBodyOptions), (ctx: Context) => {
  if (_.isEmpty(ctx.request.files)) {
    throw new BlogError(BlogErrorCode.FILE_NOT_UPLOADED);
  }
  imageService.uploadImage({ files: ctx.request.files! })
    .then(() => {
      ctx.status = http2.constants.HTTP_STATUS_CREATED;
    });
});

export default imageRouter;
