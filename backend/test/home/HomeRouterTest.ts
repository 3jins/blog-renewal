import supertest from 'supertest';
import { should } from 'chai';
import { endApp } from '@src/app';
import { Server } from 'http';
import HomeRouter from '@src/home/HomeRouter';
import { startAppForTest } from '@test/TestUtil';

describe('api test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(async () => {
    should();
    server = await startAppForTest([HomeRouter]);
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
