import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { anything, instance, mock, objectContaining, verify } from 'ts-mockito';
import PostService from '@src/post/PostService';
import { Container } from 'typedi';
import { endApp, startApp } from '../../src/app';
import { appPath } from '../data/testData';
import * as URL from '../../src/common/constant/URL';
import Language from '@src/common/constant/Language';

const postService: PostService = mock(PostService);
Container.set(PostService, instance(postService));
const PostRouter = require('@src/post/PostRouter');

describe('Post router test', () => {
  const FILE_NAME = 'test.md';

  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(() => {
    should();
    server = startApp([PostRouter.default]);
    request = supertest(server);
  });

  it(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`, async () => {
    const payload = {
      seriesId: '1234',
      language: Language.KO,
      thumbnailContent: '뚜샤!',
    };
    await request
      .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
      .field(payload)
      .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
      .expect(200);

    verify(postService.createPost(objectContaining({
      post: anything(),
      ...payload,
    }))).once();
  });

  after(() => endApp(server));
});
