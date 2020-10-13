/* eslint-disable no-console */
import Koa from 'koa';
import Router from '@koa/router';
import config from 'config';
import getConnection from './util/getDbConnection';
import HomeRouter from './home/HomeRouter';
import { Connection } from 'mongoose';
import BlogErrorHandler from './common/error/BlogErrorHandler';
import { Container } from 'typedi';


const connectToDb = () => {
  const conn: Connection = getConnection();
  conn.on('error', (err: Error) => console.error(err));
  conn.once('open', () => {
    const { name, host, port } = conn;
    console.info('Connected to MongoDB server.');
    console.info(` - name: ${name}`);
    console.info(` - host: ${host}`);
    console.info(` - port: ${port}`);
  });
};

const makeRouter = (): Router => {
  const router = new Router();
  router
    .use(HomeRouter.routes());

  return router;
};

const makeApp = (router: Router): Koa => {
  const app = new Koa();
  const blogErrorHandler: BlogErrorHandler = Container.get(BlogErrorHandler);
  app
    .use(async (ctx, next) => {
      try {
        await next();
        const { ip } = ctx.request;
        const rt = ctx.response.get('X-Response-Time');
        console.info(`${ctx.method} ${ctx.url} - ${rt} from ${ip}`);
      } catch (err) {
        blogErrorHandler.handleError(ctx, err);
      }
    })
    .use(router.routes());

  return app;
};

const startApp = () => {
  const { port } = config.get('server');
  const router = makeRouter();
  const app = makeApp(router);
  app.listen(port, () => console.info(`Server started to listening from port ${port}.`));
};

connectToDb();
startApp();

export {
  makeRouter,
  makeApp,
};
