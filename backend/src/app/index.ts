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
import { randomInt } from 'crypto';

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
      .catch((err: Error) => handleError(ctx, err)))
    .use(router.routes());

  return app;
};

const retryStartingApp = (server: Server, previousPort: number) => {
  server.close();
  let randomPort;
  do {
    randomPort = randomInt(1024, 65535);
  } while (randomPort !== previousPort);

  setTimeout(
    () => server.listen(randomPort, () => leaveLog(`Server restarted to listening from port ${randomPort}.`, LogLevel.INFO)),
    1000,
  );
};

const startApp = (routerList: Router[]): Server => {
  const { port, retryCount } = config.get('server');
  const router = makeRouter(routerList);
  const app = makeApp(router);
  let retryIdx = 0;
  leaveLog(`process: ${process}`, LogLevel.DEBUG);

  const server: Server = app.listen(
    port,
    () => leaveLog(`Server started to listening from port ${port}.`, LogLevel.INFO),
  );
  server.on('error', (err) => {
    // @ts-ignore
    if (['EADDRINUSE', 'ERR_SERVER_ALREADY_LISTEN'].includes(err.code) && retryIdx++ < retryCount) {
      leaveLog(`Retrying to start server... (${retryIdx}/${retryCount})`, LogLevel.INFO);
      retryStartingApp(server, port);
    }
  });
  return server;
};

const endApp = (server: Server) => server.close();

export { connectToDb, startApp, endApp };
