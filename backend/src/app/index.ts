/* eslint-disable no-console */
import Koa from 'koa';
import Router from '@koa/router';
import config from 'config';
import getConnection from '../util/getDbConnection';
import HomeRouter from '../home/HomeRouter';
import ImageRouter from '../image/ImageRouter';
import { Connection } from 'mongoose';
import BlogErrorHandler from '../common/error/BlogErrorHandler';
import { Container } from 'typedi';
import { Server } from 'http';


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

const _makeRouter = (): Router => {
  const router = new Router();
  router
    .use(HomeRouter.routes())
    .use(ImageRouter.routes());

  return router;
};

const _makeApp = (router: Router): Koa => {
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

const startApp = (): Server => {
  const { port } = config.get('server');
  const router = _makeRouter();
  const app = _makeApp(router);
  return app.listen(port, () => console.info(`Server started to listening from port ${port}.`));
};

const endApp = (server: Server) => server.close();

export {
  connectToDb,
  startApp,
  endApp,
};
