import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import http2 from 'http2';
import { anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Container } from 'typedi';
import PostService from '@src/post/PostService';
import { endApp } from '@src/app';
import * as URL from '@src/common/constant/URL';
import { appPath, common as commonTestData } from '@test/data/testData';
import { startAppForTest } from '@test/TestUtil';
import { GetPostPreviewResponseDto } from '@src/post/dto/PostResponseDto';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

const postService: PostService = mock(PostService);
Container.set(PostService, instance(postService));
const PostPreviewRouter = require('@src/post/PostPreviewRouter');

describe('Post Preview router test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(async () => {
    should();
    server = await startAppForTest([PostPreviewRouter.default]);
    request = supertest(server);
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`POST ${URL.PREFIX.API}${URL.ENDPOINT['POST-PREVIEW']}`, () => {
    const FILE_NAME = 'gfm+.md';

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT['POST-PREVIEW']} - normal case`, async () => {
      const baseUrl = `${URL.PREFIX.API}${URL.ENDPOINT['POST-PREVIEW']}`;

      when(postService.getPostPreview(anything()))
        .thenReturn({
          title: FILE_NAME,
          rawContent: commonTestData.simpleTexts[0],
          renderedContent: commonTestData.simpleTexts[1],
          toc: [],
        } as GetPostPreviewResponseDto);

      await request
        .post(`${baseUrl}`)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
        .expect(http2.constants.HTTP_STATUS_OK)
        .expect((res) => res.body.title.should.equal(FILE_NAME));

      verify(postService.getPostPreview(objectContaining({
        post: anything(),
      }))).once();
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT['POST-PREVIEW']} - file is absent`, async () => {
      const baseUrl = `${URL.PREFIX.API}${URL.ENDPOINT['POST-PREVIEW']}`;

      await request
        .post(`${baseUrl}`)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.FILE_NOT_UPLOADED.errorMessage);
        });
    });

    after(() => endApp(server));
  });
});
