// import Router from '@koa/router';
// import koaBody from 'koa-body';
// import { Context } from 'koa';
// import Container from 'typedi';
// import _ from 'lodash';
// import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
// import * as URL from '../common/constant/URL';
// import PostService from './PostService';
//
// const postRouter = new Router();
// const koaBodyOptions = {
//   multipart: true,
// };
// const postService: PostService = Container.get(PostService);
//
// postRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`, koaBody(koaBodyOptions), (ctx: Context) => {
//   if (_.isEmpty(ctx.request.files) || _.has(ctx.request.files!.post)) {
//     throw new Error(BlogErrorCode.FILE_NOT_UPLOADED.code);
//   }
//
//   postService.createPost({
//     post: ctx.request.files!.post,
//     ...ctx.request.body,
//   });
//   ctx.status = 200;
// });
//
// export default postRouter;
