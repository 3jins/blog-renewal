import Router from '@koa/router';
import koaBody from 'koa-body';
import { Context } from 'koa';
import Container from 'typedi';
import * as URL from '../common/constant/URL';
import PostService from './PostService';

const postRouter = new Router();
const postService: PostService = Container.get(PostService);

postRouter.post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`, koaBody(), (ctx: Context) => {
  try {
    const requestBody = ctx.request.body;
    postService.createPost(requestBody);
    ctx.status = 200;
  } catch (err) {
    console.log(err);
  }
});

export default postRouter;
