/* eslint-disable no-console */
import 'reflect-metadata';
import Koa from 'koa';
import Router from '@koa/router';
import config from 'config';
import { Connection } from 'mongoose';
import { Server } from 'http';
import * as DbConnection from '@src/common/mongodb/DbConnectionUtil';
import { handleError } from '@src/common/error/BlogErrorHandlingUtil';

const connectToDb = () => {
  DbConnection.setConnection();
  const conn: Connection = DbConnection.getConnection();
  conn.on('error', (err: Error) => console.error(err));
  conn.once('open', () => {
    const { name, host, port } = conn;
    console.info('Connected to MongoDB server.');
    console.info(` - name: ${name}`);
    console.info(` - host: ${host}`);
    console.info(` - port: ${port}`);
  });
};

const makeRouter = (apiRouterList: Router[]): Router => {
  const router = new Router();
  apiRouterList.forEach((apiRouter) => router.use(apiRouter.routes()));
  return router;
};

const makeApp = (router: Router): Koa => {
  const app = new Koa();
  app
    .use(async (ctx, next) => {
      const { ip } = ctx.request;
      const rt = ctx.response.get('X-Response-Time');
      console.info(`${ctx.method} ${ctx.url} - ${rt} from ${ip}`);
      await next();
    })
    .use((ctx, next) => next()
      .catch((err) => handleError(ctx, err)))
    .use(router.routes());

  return app;
};

const startApp = (routerList: Router[]): Server => {
  const { port } = config.get('server');
  const router = makeRouter(routerList);
  const app = makeApp(router);
  return app.listen(port, () => console.info(`Server started to listening from port ${port}.`));
};

const endApp = (server: Server) => server.close();

export { connectToDb, startApp, endApp };
