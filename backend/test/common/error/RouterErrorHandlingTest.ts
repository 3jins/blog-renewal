import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { anything, instance, mock, when } from 'ts-mockito';
import { Container } from 'typedi';
import { endApp } from '@src/app';
import * as URL from '@src/common/constant/URL';
import BlogError from '@src/common/error/BlogError';
import TagService from '@src/tag/TagService';
import { blogErrorCode, common as commonTestData } from '@test/data/testData';
import { startAppForTest } from '@test/TestUtil';

const tagService: TagService = mock(TagService);
Container.set(TagService, instance(tagService));
delete require.cache[require.resolve('@src/tag/TagRouter')];
const TagRouter = require('@src/tag/TagRouter');

describe('Router error handling test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;
  const { tag2: { name: tagName }, postMetaIdList } = commonTestData;

  before(async () => {
    should();
    server = await startAppForTest([TagRouter.default]);
    request = supertest(server);
  });

  it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - error handling`, async () => {
    when(tagService.findTag(anything()))
      .thenThrow(new BlogError(blogErrorCode.TEST_ERROR));

    await request
      .get(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`)
      .query(() => ({ name: tagName, postId: postMetaIdList[0] }))
      .expect(blogErrorCode.TEST_ERROR.httpErrorCode)
      .expect((res) => {
        res.body.message.should.equal(commonTestData.simpleTexts[0]);
      });
  });

  after(() => {
    endApp(server);
  });
});
