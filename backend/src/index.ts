/* eslint-disable no-console */
import Koa from 'koa';
import Router from '@koa/router';
import config from 'config';
import index from './api/index';

const { port } = config.get('server');
const app = new Koa();
const router = new Router();

router.use('/', index.routes());

app
  .use(async (ctx, next) => {
    await next();
    const { ip } = ctx.request;
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt} from ${ip}`);
  })
  .use(router.routes())
  .listen(port, () => console.log(`Server started to listening from port ${port}.`));
