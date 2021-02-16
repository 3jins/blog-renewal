import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { mock } from 'ts-mockito';
import PostService from '@src/post/PostService';
import { Container } from 'typedi';
import { endApp, startApp } from '../../src/app';
import { common as commonTestData } from '../data/testData';
import * as URL from '../../src/common/constant/URL';

Container.set(PostService, mock(PostService));
const PostRouter = require('@src/post/PostRouter');

describe('Image integration test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(() => {
    should();
    server = startApp([PostRouter.default]);
    request = supertest(server);
  });

  it(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`, async () => {
    const serviceParamDto = {
      title: commonTestData.post1.title,
      rawContent: commonTestData.post1.rawContent,
      language: commonTestData.post1.language,
      thumbnailContent: commonTestData.post1.thumbnailContent,
      createdDate: new Date(),
    };
    await request
      .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
      .send(serviceParamDto)
      .set('Accept', 'application/json')
      .expect(200);
  });

  after(() => endApp(server));
});
