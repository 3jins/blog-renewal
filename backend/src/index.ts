/* eslint-disable no-console */
import Koa from 'koa';
import Router from '@koa/router';
import config from 'config';
import getConnection from './db/getConnection';
import home from './api/home';
import { Connection } from 'mongoose';

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

const startServer = () => {
  const { port } = config.get('server');
  const app = new Koa();
  const router = new Router();

  router.use('/', home.routes());
  app
    .use(async (ctx, next) => {
      await next();
      const { ip } = ctx.request;
      const rt = ctx.response.get('X-Response-Time');
      console.info(`${ctx.method} ${ctx.url} - ${rt} from ${ip}`);
    })
    .use(router.routes())
    .listen(port, () => console.info(`Server started to listening from port ${port}.`));
};

connectToDb();
startServer();
