import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Container } from 'typedi';
import PostService from '@src/post/PostService';
import { endApp, startApp } from '@src/app';
import * as URL from '@src/common/constant/URL';
import Language from '@src/common/constant/Language';
import { appPath, common as commonTestData } from '@test/data/testData';
import * as http2 from 'http2';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { CreateNewPostRequestDto } from '@src/post/dto/PostRequestDto';

const postService: PostService = mock(PostService);
Container.set(PostService, instance(postService));
const PostRouter = require('@src/post/PostRouter');

describe('Post router test', () => {
  const FILE_NAME = 'gfm+.md';

  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(() => {
    should();
    server = startApp([PostRouter.default]);
    request = supertest(server);
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW}`, () => {
    it(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW} - normal case`, async () => {
      const requestDto: CreateNewPostRequestDto = {
        seriesName: commonTestData.series1.name,
        language: Language.KO,
      };

      when(postService.createNewPost(anything()))
        .thenResolve();

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW}`)
        .field(requestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
        .expect(http2.constants.HTTP_STATUS_CREATED);
      verify(postService.createNewPost(objectContaining({
        post: anything(),
        ...requestDto,
      }))).once();
    });

    it(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW} - parameter error(file is absent)`, async () => {
      const requestDto: CreateNewPostRequestDto = {
        seriesName: commonTestData.series1.name,
        language: Language.KO,
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW}`)
        .field(requestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.FILE_NOT_UPLOADED.errorMessage);
        });
    });

    it(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW}`)
        .field(strangeRequestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW} - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = {
        seriesName: commonTestData.series1.name,
        language: Language.KO,
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.BEHAVIOR.NEW}`)
        .field(typeDistortedRequestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/json' })
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  after(() => endApp(server));
});
