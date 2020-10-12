import supertest from 'supertest';
import { should } from 'chai';
import * as URL from '../src/common/constant/URL';
import { makeApp, makeRouter } from '../src';
import Koa = require('koa');
import Router = require('@koa/router');

describe('api test', () => {
  let app: Koa;
  let router: Router;
  let request: supertest.SuperTest<supertest.Test>;
  let server;

  before(() => {
    should();
    router = makeRouter();
    app = makeApp(router);
    request = supertest(app.callback());
  });

  it('/', async () => {
    const response = await request
      .get('/')
      .expect(200);
    response.text.should.equal('Hello, world!');
  });
});
