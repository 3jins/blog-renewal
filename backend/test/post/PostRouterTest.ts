import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { anything, deepEqual, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { Container } from 'typedi';
import * as http2 from 'http2';
import PostService from '@src/post/PostService';
import { endApp } from '@src/app';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import {
  AddUpdatedVersionPostRequestDto,
  CreateNewPostRequestDto,
  DeletePostRequestDto,
  DeletePostVersionRequestDto,
  FindPostRequestDto,
} from '@src/post/dto/PostRequestDto';
import { FindPostParamDto } from '@src/post/dto/PostParamDto';
import HttpHeaderField from '@common/constant/HttpHeaderField';
import * as URL from '@common/constant/URL';
import Language from '@common/constant/Language';
import { appPath, common as commonTestData } from '@test/data/testData';
import { startAppForTest } from '@test/TestUtil';
import { PostDto } from '@src/post/dto/PostResponseDto';

const postService: PostService = mock(PostService);
Container.set(PostService, instance(postService));
const PostRouter = require('@src/post/PostRouter');

describe('Post router test', () => {
  const FILE_NAME = 'gfm+.md';

  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(async () => {
    should();
    server = await startAppForTest([PostRouter.default]);
    request = supertest(server);
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo`, () => {
    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - normal case`, async () => {
      const requestDto: FindPostRequestDto = {
        categoryId: commonTestData.objectIdList[0],
        seriesId: commonTestData.objectIdList[1],
        tagIdList: [commonTestData.objectIdList[2], commonTestData.objectIdList[3]],
        isDeleted: false,
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
        postVersionId: commonTestData.objectIdList[4],
        title: encodeURI(commonTestData.post1V1.title),
        rawContent: encodeURI(commonTestData.post1V1.rawContent),
        renderedContent: encodeURI(commonTestData.post1V1.renderedContent),
        language: commonTestData.post1V1.language.toLocaleLowerCase(),
        thumbnailContent: encodeURI(commonTestData.post1V1.thumbnailContent),
        thumbnailImageId: commonTestData.objectIdList[4],
        updateDateFrom: commonTestData.dateList[0].toISOString(),
        updateDateTo: commonTestData.dateList[1].toISOString(),
        isLatestVersion: commonTestData.post1V1.isLatestVersion,
        isOnlyExactSameFieldFound: true,
      };
      const paramDto: FindPostParamDto = {
        ...requestDto,
        language: commonTestData.post1V1.language,
        updateDateFrom: commonTestData.dateList[0],
        updateDateTo: commonTestData.dateList[1],
      };

      when(postService.findPost(anything()))
        .thenResolve({ postList: [{ postNo: commonTestData.post1V1.postNo } as PostDto] });

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1V1.postNo}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK)
        .expect((res) => res.body.should.deep.equal({ postNo: commonTestData.post1V1.postNo }));
      verify(postService.findPost(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST} - normal case`, async () => {
      const requestDto: FindPostRequestDto = {
        postNo: commonTestData.post1V1.postNo,
        categoryId: commonTestData.objectIdList[0],
        seriesId: commonTestData.objectIdList[1],
        tagIdList: [commonTestData.objectIdList[2], commonTestData.objectIdList[3]],
        isDeleted: false,
        isPrivate: false,
        isDeprecated: false,
        isDraft: false,
        postVersionId: commonTestData.objectIdList[4],
        title: commonTestData.post1V1.title,
        rawContent: commonTestData.post1V1.rawContent,
        renderedContent: commonTestData.post1V1.renderedContent,
        language: commonTestData.post1V1.language.toLocaleLowerCase(),
        thumbnailContent: commonTestData.post1V1.thumbnailContent,
        thumbnailImageId: commonTestData.objectIdList[4],
        updateDateFrom: commonTestData.dateList[0].toISOString(),
        updateDateTo: commonTestData.dateList[1].toISOString(),
        isLatestVersion: commonTestData.post1V1.isLatestVersion,
        isOnlyExactSameFieldFound: true,
      };
      const paramDto: FindPostParamDto = {
        ...requestDto,
        language: commonTestData.post1V1.language,
        updateDateFrom: commonTestData.dateList[0],
        updateDateTo: commonTestData.dateList[1],
      };

      when(postService.findPost(anything()))
        .thenResolve({ postList: [{ postNo: commonTestData.post1V1.postNo } as PostDto] });

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK)
        .expect((res) => res.body.should.deep.equal({ postList: [{ postNo: commonTestData.post1V1.postNo }] }));
      verify(postService.findPost(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - parameter error(postVersionId is not objectId format)`, async () => {
      const strangeRequestDto = {
        postVersionId: encodeURI(commonTestData.simpleTexts[1]),
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1V1.postNo}`)
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
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1V1.postNo}`)
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
            .get(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post1V1.postNo}`)
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

      when(postService.createNewPost(anything()))
        .thenResolve(commonTestData.post1V1.postNo);

      await request
        .post(`${baseUrl}`)
        .field({
          seriesName: commonTestData.series1.name,
          language: Language.KO,
          tagNameList: JSON.stringify([commonTestData.tag1.name, commonTestData.tag2.name]),
        })
        .attach('post', `${appPath.testData}/${FILE_NAME}`, { contentType: 'application/octet-stream' })
        .expect(http2.constants.HTTP_STATUS_CREATED)
        .expect((res) => res.get(HttpHeaderField.CONTENT_LOCATION).should.equal(`${baseUrl}/${commonTestData.post1V1.postNo}`))
        .expect((res) => res.body.should.equal(commonTestData.post1V1.postNo));

      verify(postService.createNewPost(objectContaining({
        post: anything(),
        seriesName: commonTestData.series1.name,
        language: Language.KO,
        tagNameList: [commonTestData.tag1.name, commonTestData.tag2.name],
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
  describe(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo`, () => {
    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - normal case`, async () => {
      const requestDto: Object = {
        seriesName: commonTestData.series1.name,
      };

      when(postService.updatePostMetaData(anything()))
        .thenResolve();

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post2V1.postNo}`)
        .field(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(postService.updatePostMetaData(objectContaining({
        postNo: commonTestData.post2V1.postNo,
        ...requestDto,
      }))).once();
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post2V1.postNo}`)
        .field(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.POST}/:postNo - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = {
        postNo: '내가 창조적일 땐 현실도 날 못 타일러',
        seriesName: commonTestData.series1.name,
      };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.post2V1.postNo}`)
        .field(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`, () => {
    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION} - normal case`, async () => {
      const requestDto: DeletePostVersionRequestDto = {
        postVersionId: commonTestData.objectIdList[0],
      };

      when(postService.deletePostVersion(anything()))
        .thenResolve();

      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}/${commonTestData.objectIdList[0]}`)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(postService.deletePostVersion(objectContaining({
        ...requestDto,
      }))).once();
    });

    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION} - parameter error(parameter not passed)`, async () => {
      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}`)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST); // 'VERSION' will be recognized as a `postNo`
    });

    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION} - parameter error(not objectId type)`, async () => {
      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.POST}${URL.DETAIL.VERSION}/${encodeURI(commonTestData.simpleTexts[0])}`)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.POST}`, () => {
    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.POST} - normal case`, async () => {
      const requestDto: DeletePostRequestDto = {
        postNo: commonTestData.postMeta1.postNo,
      };

      when(postService.deletePost(anything()))
        .thenResolve();

      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${commonTestData.postMeta1.postNo}`)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(postService.deletePost(objectContaining({
        ...requestDto,
      }))).once();
    });

    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.POST} - parameter error(parameter not passed)`, async () => {
      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.POST}`)
        .expect(http2.constants.HTTP_STATUS_NOT_FOUND);
    });

    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.POST} - parameter error(not objectId type)`, async () => {
      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${encodeURI(commonTestData.simpleTexts[0])}`)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  after(() => endApp(server));
});
