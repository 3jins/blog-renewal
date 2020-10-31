import supertest from 'supertest';
import { should } from 'chai';
import { endApp, startApp } from '@src/app';
import { Server } from 'http';

describe('api test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(() => {
    should();
    server = startApp();
    request = supertest(server);
  });

  it('/', async () => {
    const response = await request
      .get('/')
      .expect(200);
    response.text.should.equal('Hello, world!');
  });

  after(() => {
    endApp(server);
  });
});
