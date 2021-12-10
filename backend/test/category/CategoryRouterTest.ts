import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { anything, deepEqual, instance, mock, reset, verify, when } from 'ts-mockito';
import { Container } from 'typedi';
import { endApp, startApp } from '@src/app';
import * as URL from '@src/common/constant/URL';
import CategoryService from '@src/category/CategoryService';
import {
  CreateCategoryRequestDto,
  DeleteCategoryRequestDto,
  FindCategoryRequestDto,
  UpdateCategoryRequestDto,
} from '@src/category/dto/CategoryRequestDto';
import {
  CreateCategoryParamDto,
  FindCategoryParamDto,
  UpdateCategoryParamDto,
} from '@src/category/dto/CategoryParamDto';
import { common as commonTestData } from '@test/data/testData';
import * as http2 from 'http2';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import HttpHeaderField from '@src/common/constant/HttpHeaderField';

const categoryService: CategoryService = mock(CategoryService);
Container.set(CategoryService, instance(categoryService));
delete require.cache[require.resolve('@src/category/CategoryRouter')];
const CategoryRouter = require('@src/category/CategoryRouter');

describe('Category router test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  const {
    category2: { name: categoryName, level: categoryLevel },
    category3: { name: categoryNameToBe },
    objectIdList: [categoryId],
  } = commonTestData;

  before(() => {
    should();
    server = startApp([CategoryRouter.default]);
    request = supertest(server);
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`GET ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:name`, () => {
    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:name - normal case`, async () => {
      const requestDto: FindCategoryRequestDto = {
        parentCategoryId: categoryId,
        level: categoryLevel,
      };
      const paramDto: FindCategoryParamDto = { ...requestDto };

      when(categoryService.findCategory(anything()))
        .thenResolve({ categoryList: [] });

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/${encodeURI(categoryName)}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(categoryService.findCategory(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY} - normal case`, async () => {
      const requestDto: FindCategoryRequestDto = {
        parentCategoryId: categoryId,
        level: categoryLevel,
      };
      const paramDto: FindCategoryParamDto = { ...requestDto };

      when(categoryService.findCategory(anything()))
        .thenResolve({ categoryList: [] });

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`)
        .query(requestDto)
        .expect(http2.constants.HTTP_STATUS_OK);
      verify(categoryService.findCategory(deepEqual(paramDto)));
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:name - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/${encodeURI(categoryName)}`)
        .query(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`GET ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/:name - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = {
        parentCategoryId: categoryId,
        level: false,
      };

      await request
        .get(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/${encodeURI(categoryName)}`)
        .query(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`POST ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, () => {
    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY} - normal case`, async () => {
      const url = `${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`;
      const requestDto: CreateCategoryRequestDto = {
        name: categoryName,
        parentCategoryId: categoryId,
      };
      const paramDto: CreateCategoryParamDto = { ...requestDto };

      when(categoryService.createCategory(anything()))
        .thenResolve(categoryName);

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`)
        .send(requestDto)
        .expect(201)
        .expect((res) => res.get(HttpHeaderField.CONTENT_LOCATION).should.equal(`${url}/${encodeURI(categoryName)}`));
      verify(categoryService.createCategory(deepEqual<CreateCategoryParamDto>(paramDto))).once();
    });

    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`)
        .send(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (res.get(HttpHeaderField.CONTENT_LOCATION) === undefined).should.be.true;
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, () => {
    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY} - normal case`, async () => {
      const requestDto: UpdateCategoryRequestDto = {
        name: categoryName,
        categoryToBe: {
          name: categoryNameToBe,
          parentCategoryId: categoryId,
        },
      };
      const paramDto: UpdateCategoryParamDto = { ...requestDto };

      when(categoryService.updateCategory(anything()))
        .thenResolve();

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`)
        .send(requestDto)
        .expect(200);
      verify(categoryService.updateCategory(deepEqual<UpdateCategoryRequestDto>(paramDto))).once();
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY} - parameter error(key)`, async () => {
      const strangeRequestDto = {
        doWeLearnMathTo: 'add the dead\'s sum',
        subtractTheWeakOnes: 'count cash for great ones',
        weDoMultiply: 'but divide the nation',
      };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`)
        .send(strangeRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });

    it(`PATCH ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY} - parameter error(type of value)`, async () => {
      const typeDistortedRequestDto = {
        name: categoryName,
        categoryToBe: true,
      };

      await request
        .patch(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`)
        .send(typeDistortedRequestDto)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.INVALID_REQUEST_PARAMETER.errorMessage);
        });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, () => {
    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY} - normal case`, async () => {
      when(categoryService.deleteCategory(anything()))
        .thenResolve();

      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/${categoryName}`)
        .expect(200);
      verify(categoryService.deleteCategory(deepEqual<DeleteCategoryRequestDto>({ name: categoryName }))).once();
    });

    it(`DELETE ${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY} - parameter error(parameter not passed)`, async () => {
      await request
        .delete(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`)
        .expect(http2.constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  after(() => {
    endApp(server);
    reset(categoryService);
  });
});
