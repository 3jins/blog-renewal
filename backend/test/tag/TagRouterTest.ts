import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import * as http2 from 'http2';
import { anything, deepEqual, instance, mock, reset, verify, when } from 'ts-mockito';
import { Container } from 'typedi';
import { endApp, startApp } from '@src/app';
import TagService from '@src/tag/TagService';
import {
  CreateTagRequestDto,
  DeleteTagRequestDto,
  FindTagRequestDto,
  UpdateTagRequestDto,
} from '@src/tag/dto/TagRequestDto';
import { CreateTagParamDto, FindTagParamDto, UpdateTagParamDto } from '@src/tag/dto/TagParamDto';
import { common as commonTestData } from '@test/data/testData';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import * as URL from '@src/common/constant/URL';
import HttpHeaderField from '@src/common/constant/HttpHeaderField';

const tagService: TagService = mock(TagService);
Container.set(TagService, instance(tagService));
delete require.cache[require.resolve('@src/tag/TagRouter')];
const TagRouter = require('@src/tag/TagRouter');

describe('Tag router test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  const { tag2: { name: tagName }, postMetaIdList } = commonTestData;

  before(() => {
    should();
    server = startApp([TagRouter.default]);
    request = supertest(server);
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`GET ${URL.PREFIX.API}${URL.ENDPOINT.TAG}/:name`, () => {
    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.TAG}/:name - normal case`, async () => {
      const requestDto: FindTagRequestDto = {
        isOnlyExactNameFound: true,
        postMetaIdList,
        isAndCondition: true,
      };
      const paramDto: FindTagParamDto = { ...requestDto, name: tagName };

      when(tagService.findTag(anything()))
        .thenResolve([]);

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}/${encodeURI(tagName)}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(tagService.findTag(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - normal case`, async () => {
      const requestDto: FindTagRequestDto = {
        isOnlyExactNameFound: true,
        postMetaIdList,
        isAndCondition: true,
      };
      const paramDto: FindTagParamDto = { ...requestDto, name: tagName };

      when(tagService.findTag(anything()))
        .thenResolve([]);

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(tagService.findTag(deepEqual(paramDto)));
    });


    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.TAG}/:name - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}/${encodeURI(tagName)}`)
        .query(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.TAG}/:name - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = {
        name: tagName,
        isOnlyExactNameFound: 1,
        postMetaIdList,
        isAndCondition: true,
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}/${encodeURI(tagName)}`)
        .query(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`POST ${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, () => {
    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - normal case`, async () => {
      const url = `${URL.PREFIX.API}${URL.ENDPOINT.TAG}`;
      const requestDto: CreateTagRequestDto = { name: tagName };
      const paramDto: CreateTagParamDto = { ...requestDto };

      when(tagService.createTag(anything()))
        .thenResolve(tagName);

      await request
        .post(url)
        .send(requestDto)
        .expect(201)
        .expect((res) => res.get(HttpHeaderField.CONTENT_LOCATION).should.equal(`${url}/${encodeURI(tagName)}`));
      verify(tagService.createTag(deepEqual<CreateTagParamDto>(paramDto))).once();
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`)
        .send(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (res.get(HttpHeaderField.CONTENT_LOCATION) === undefined).should.be.true;
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = { name: tagName, postMetaIdList: true };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`)
        .send(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (res.get(HttpHeaderField.CONTENT_LOCATION) === undefined).should.be.true;
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, () => {
    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - normal case`, async () => {
      const requestDto: UpdateTagRequestDto = {
        originalName: tagName,
        tagToBe: {
          name: '돈 명예 평화 야\'망 사\'랑 또 뭐가 있더라',
          postMetaIdToBeAddedList: postMetaIdList.splice(0, 2),
          postMetaIdToBeRemovedList: postMetaIdList.splice(2, 1),
        },
      };
      const paramDto: UpdateTagParamDto = { ...requestDto };

      when(tagService.updateTag(anything()))
        .thenResolve();

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`)
        .send(requestDto)
        .expect(200);
      verify(tagService.updateTag(deepEqual<UpdateTagRequestDto>(paramDto))).once();
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`)
        .send(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = { name: tagName, postMetaIdList: [true, false] };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`)
        .send(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.TAG}`, () => {
    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - normal case`, async () => {
      when(tagService.deleteTag(anything()))
        .thenResolve();

      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}/${encodeURI(tagName)}`)
        .expect(200);
      verify(tagService.deleteTag(deepEqual<DeleteTagRequestDto>({ name: tagName }))).once();
    });

    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.TAG} - parameter error(parameter not passed)`, async () => {
      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.TAG}`)
        .expect(http2.constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  after(() => {
    endApp(server);
    reset(tagService);
  });
});
