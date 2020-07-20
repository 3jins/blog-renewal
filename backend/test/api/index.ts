import request from 'supertest';
import {should} from 'chai';
import Koa = require('koa');
import Router = require('@koa/router');
import indexRouter from '../../src/api/index';

describe('Backend api test', () => {
  let app : Koa;
  let router : Router;

  before(() => {
    app = new Koa();
    router = new Router();
    should();
  });

  it(`should show context got from router`, async () => {
    router.use('/', indexRouter.routes());
    app.use(router.routes());
    const response = await request(app.callback()).get('/');
    response.status.should.equal(200);
    response.text.should.equal('Hello, world!');
  });
});
