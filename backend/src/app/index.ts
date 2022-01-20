import 'reflect-metadata';
import _ from 'lodash';
import Koa from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import cors from '@koa/cors';
import config from 'config';
import { Connection } from 'mongoose';
import { Server } from 'http';
import * as DbConnection from '@src/common/mongodb/DbConnectionUtil';
import { leaveLog } from '@src/common/logging/LoggingUtil';
import LogLevel from '@src/common/logging/LogLevel';
import { leaveRequestLog } from '@src/common/middleware/RequestLogger';
import { handleRequestError } from '@src/common/middleware/RequestErrorHandler';

const connectToDb = () => {
  const { uri } = config.get('db');
  DbConnection.setConnection(uri);
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
    .use(leaveRequestLog())
    .use(handleRequestError())
    .use(router.routes());
  return app;
};

const startApp = (routerList: Router[], port?: number): Server => {
  const { port: configPort } = config.get('server');
  const portToUse = _.isNil(port) ? configPort : port;
  const router = makeRouter(routerList);
  const app = makeApp(router);
  leaveLog(`process: ${process}`, LogLevel.DEBUG);
  return app.listen(
    portToUse,
    () => leaveLog(`Server started to listening from port ${portToUse}.`, LogLevel.INFO),
  );
};

const endApp = (server: Server) => server.close();

export { connectToDb, startApp, endApp };
