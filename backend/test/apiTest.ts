import request from 'supertest';
import { should } from 'chai';
import homeRouter from '../src/home/home';
import Koa = require('koa');
import Router = require('@koa/router');

describe('api test', () => {
  let app: Koa;
  let router: Router;

  before(() => {
    app = new Koa();
    router = new Router();
    should();
  });

  it('/', async () => {
    router.use('/', homeRouter.routes());
    app.use(router.routes());
    const response = await request(app.callback()).get('/');
    response.status.should.equal(200);
    response.text.should.equal('Hello, world!');
  });
});
