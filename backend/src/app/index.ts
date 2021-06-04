import 'reflect-metadata';
import Koa from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import cors from '@koa/cors';
import config from 'config';
import { Connection } from 'mongoose';
import { Server } from 'http';
import * as DbConnection from '@src/common/mongodb/DbConnectionUtil';
import { handleError } from '@src/common/error/BlogErrorHandlingUtil';
import { leaveLog } from '@src/common/logging/LoggingUtil';
import LogLevel from '@src/common/logging/LogLevel';

const connectToDb = () => {
  DbConnection.setConnection();
  const conn: Connection = DbConnection.getConnection();
  conn.on('error', (err: Error) => leaveLog(err.toString(), LogLevel.ERROR));
  conn.once('open', () => {
    const { name, host, port } = conn;
    leaveLog('Connected to MongoDB server.', LogLevel.INFO);
    leaveLog(` - name: ${name}`, LogLevel.INFO);
    leaveLog(` - host: ${host}`, LogLevel.INFO);
    leaveLog(` - port: ${port}`, LogLevel.INFO);
  });
};

const makeRouter = (apiRouterList: Router[]): Router => {
  const router = new Router();
  apiRouterList.forEach((apiRouter) => router.use(apiRouter.routes()));
  return router;
};

const makeApp = (router: Router): Koa => {
  const { url: clientUrl, port: clientPort } = config.get('client');
  const app = new Koa();
  app
    .use(cors({ origin: `${clientUrl}:${clientPort}` }))
    .use(koaBody())
    .use(async (ctx, next) => {
      const { ip } = ctx.request;
      const rt = ctx.response.get('X-Response-Time');
      leaveLog(`${ctx.method} ${ctx.url} - ${rt} from ${ip}`, LogLevel.INFO);
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
  return app.listen(port, () => leaveLog(`Server started to listening from port ${port}.`, LogLevel.INFO));
};

const endApp = (server: Server) => server.close();

export { connectToDb, startApp, endApp };
