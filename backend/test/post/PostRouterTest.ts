import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Container } from 'typedi';
import PostService from '@src/post/PostService';
import { endApp, startApp } from '@src/app';
import * as URL from '@src/common/constant/URL';
import Language from '@src/common/constant/Language';
import { appPath, common as commonTestData } from '@test/data/testData';
import * as http2 from 'http2';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import {
  AddUpdatedVersionPostRequestDto,
  CreateNewPostRequestDto,
  FindPostRequestDto,
  UpdatePostMetaDataRequestDto,
} from '@src/post/dto/PostRequestDto';
import HttpHeaderField from '@src/common/constant/HttpHeaderField';
import { FindPostParamDto } from '@src/post/dto/PostParamDto';

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
  describe(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo`, () => {
    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - normal case`, async () => {
      const requestDto: FindPostRequestDto = {
        categoryId: commonTestData.objectIdList[0],
        seriesId: commonTestData.objectIdList[1],
        tagIdList: [commonTestData.objectIdList[2], commonTestData.objectIdList[3]],
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
        postVersionId: commonTestData.objectIdList[4],
        title: encodeURI(commonTestData.post1.title),
        rawContent: encodeURI(commonTestData.post1.rawContent),
        renderedContent: encodeURI(commonTestData.post1.renderedContent),
        language: commonTestData.post1.language.toLocaleLowerCase(),
        thumbnailContent: encodeURI(commonTestData.post1.thumbnailContent),
        thumbnailImageId: commonTestData.objectIdList[4],
        updateDateFrom: commonTestData.dateList[0].toISOString(),
        updateDateTo: commonTestData.dateList[1].toISOString(),
        isLatestVersion: commonTestData.post1.isLatestVersion,
        isOnlyExactSameFieldFound: true,
      };
      const paramDto: FindPostParamDto = {
        ...requestDto,
        language: commonTestData.post1.language,
        updateDateFrom: commonTestData.dateList[0],
        updateDateTo: commonTestData.dateList[1],
      };

      when(postService.findPost(anything()))
        .thenResolve({ postList: [] });

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1.postNo}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(postService.findPost(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST} - normal case`, async () => {
      const requestDto: FindPostRequestDto = {
        postNo: commonTestData.post1.postNo,
        categoryId: commonTestData.objectIdList[0],
        seriesId: commonTestData.objectIdList[1],
        tagIdList: [commonTestData.objectIdList[2], commonTestData.objectIdList[3]],
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
        postVersionId: commonTestData.objectIdList[4],
        title: commonTestData.post1.title,
        rawContent: commonTestData.post1.rawContent,
        renderedContent: commonTestData.post1.renderedContent,
        language: commonTestData.post1.language.toLocaleLowerCase(),
        thumbnailContent: commonTestData.post1.thumbnailContent,
        thumbnailImageId: commonTestData.objectIdList[4],
        updateDateFrom: commonTestData.dateList[0].toISOString(),
        updateDateTo: commonTestData.dateList[1].toISOString(),
        isLatestVersion: commonTestData.post1.isLatestVersion,
        isOnlyExactSameFieldFound: true,
      };
      const paramDto: FindPostParamDto = {
        ...requestDto,
        language: commonTestData.post1.language,
        updateDateFrom: commonTestData.dateList[0],
        updateDateTo: commonTestData.dateList[1],
      };

      when(postService.findPost(anything()))
        .thenResolve({ postList: [] });

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1.postNo}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(postService.findPost(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - parameter error(postVersionId is not objectId format)`, async () => {
      const strangeRequestDto = {
        postVersionId: encodeURI(commonTestData.simpleTexts[1]),
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1.postNo}`)
        .query(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1.postNo}`)
        .query(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - parameter error(ctx.params)`, async () => {
      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${encodeURI(commonTestData.simpleTexts[0])}`)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    const typeDistortedRequestDtoList: Object[] = [
      { updateDateFrom: 12 },
      { language: 'Java' },
      { isOnlyExactSameFieldFound: 'ambiguous' },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    typeDistortedRequestDtoList.forEach((typeDistortedRequestDto, testIdx) => {
      // eslint-disable-next-line mocha/no-setup-in-describe
      describe(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - parameter error(type of value)`, () => {
        it(`case ${testIdx}: ${typeDistortedRequestDto}`, async () => {
          await request
            .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1.postNo}`)
            .query(typeDistortedRequestDto)
            .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
            .expect((res) => {
              (!!(res.body.message)).should.be.true;
              res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
            });
        });
      });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST}`, () => {
    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST} - normal case`, async () => {
      const baseUrl = `${URL.PREFIX.API}${URL.ENDPOINT.POST}`;
      const requestDto: CreateNewPostRequestDto = {
        seriesName: commonTestData.series1.name,
        language: Language.KO,
      };

      when(postService.createNewPost(anything()))
        .thenResolve(commonTestData.post1.postNo);

      await request
        .post(`${baseUrl}`)
        .field(requestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
        .expect(http2.constants.HTTP_STATUS_CREATED)
        .expect((res) => res.get(HttpHeaderField.CONTENT_LOCATION).should.equal(`${baseUrl}/${commonTestData.post1.postNo}`));

      verify(postService.createNewPost(objectContaining({
        post: anything(),
        ...requestDto,
      }))).once();
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST} - parameter error(file is absent)`, async () => {
      const requestDto: CreateNewPostRequestDto = {
        seriesName: commonTestData.series1.name,
        language: Language.KO,
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
        .field(requestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.FILE_NOT_UPLOADED.errorMessage);
        });
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
        .field(strangeRequestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST} - parameter error(type of value)`, async () => {
      const requestDto = {
        seriesName: commonTestData.series1.name,
        language: Language.KO,
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
        .field(requestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/json' })
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`, () => {
    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION} - normal case`, async () => {
      const baseUrl = `${URL.PREFIX.API}${URL.ENDPOINT.POST}`;
      const requestDto: AddUpdatedVersionPostRequestDto = {
        postNo: commonTestData.post2V1.postNo,
        language: Language.KO,
      };

      when(postService.addUpdatedVersionPost(anything()))
        .thenResolve(commonTestData.objectIdList[0]);

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`)
        .field(requestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
        .expect(http2.constants.HTTP_STATUS_CREATED)
        .expect((res) => res.get(HttpHeaderField.CONTENT_LOCATION)
          .should.equal(`${baseUrl}/${commonTestData.post2V1.postNo}?postVersionId=${commonTestData.objectIdList[0]}`));

      verify(postService.addUpdatedVersionPost(objectContaining({
        post: anything(),
        ...requestDto,
      }))).once();
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION} - parameter error(file is absent)`, async () => {
      const requestDto: AddUpdatedVersionPostRequestDto = {
        postNo: commonTestData.post2V1.postNo,
        language: Language.KO,
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`)
        .field(requestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.FILE_NOT_UPLOADED.errorMessage);
        });
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`)
        .field(strangeRequestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION} - parameter error(type of value)`, async () => {
      const requestDto: AddUpdatedVersionPostRequestDto = {
        postNo: commonTestData.post2V1.postNo,
        language: Language.KO,
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`)
        .field(requestDto)
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/json' })
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.POST}`, () => {
    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.POST} - normal case`, async () => {
      const requestDto: UpdatePostMetaDataRequestDto = {
        postNo: commonTestData.post2V1.postNo,
        seriesName: commonTestData.series1.name,
      };

      when(postService.updatePostMetaData(anything()))
        .thenResolve();

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
        .field(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(postService.updatePostMetaData(objectContaining({
        ...requestDto,
      }))).once();
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.POST} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
        .field(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.POST} - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = {
        postNo: '내가 창조적일 땐 현실도 날 못 타일러',
        seriesName: commonTestData.series1.name,
      };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
        .field(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  after(() => endApp(server));
});
