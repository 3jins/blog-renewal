import { should } from 'chai';
import sinon from 'sinon';
import { anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { ClientSession, Connection, Types } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import CategoryService from '@src/category/CategoryService';
import CategoryRepository from '@src/category/CategoryRepository';
import {
  CreateCategoryParamDto,
  DeleteCategoryParamDto,
  FindCategoryParamDto,
  UpdateCategoryParamDto,
} from '@src/category/dto/CategoryParamDto';
import {
  CreateCategoryRepoParamDto,
  DeleteCategoryRepoParamDto,
  FindCategoryRepoParamDto,
  UpdateCategoryRepoParamDto,
} from '@src/category/dto/CategoryRepoParamDto';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { CategoryDoc } from '@src/category/Category';
import { createMongoMemoryReplSet, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { FindCategoryResponseDto } from '@src/category/dto/CategoryResponseDto';
import { abortTestTransaction, errorShouldBeThrown, replaceUseTransactionForTest } from '@test/TestUtil';
import { common as commonTestData } from '@test/data/testData';

describe('CategoryService test', () => {
  let sandbox;
  let replSet: MongoMemoryReplSet;
  let conn: Connection;
  let session: ClientSession;
  let categoryService: CategoryService;
  let categoryRepository: CategoryRepository;

  const categoryLevel1 = 0;
  const {
    category1: { name: categoryName1 },
    category2: { name: categoryName2, level: categoryLevel2 },
    objectIdList: [categoryId1, categoryId2],
  } = commonTestData;

  before(async () => {
    categoryRepository = spy(mock(CategoryRepository));
    categoryService = new CategoryService(instance(categoryRepository));
    should();
    replSet = await createMongoMemoryReplSet();
    conn = setConnection(replSet.getUri());
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    session = await conn.startSession();
    session.startTransaction();
    await replaceUseTransactionForTest(sandbox, session);
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
    await replSet.stop();
  });

  describe('findCategory test', () => {
    it('findCategory - full parameter', async () => {
      const nameOnlyParamDto: FindCategoryParamDto = {
        parentCategoryId: categoryId2,
        name: categoryName2,
        level: categoryLevel2,
      };
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([]);

      await categoryService.findCategory(nameOnlyParamDto);
      const repoParamDto: FindCategoryRepoParamDto = { ...nameOnlyParamDto };
      verify(categoryRepository.findCategory(deepEqual<FindCategoryRepoParamDto>(repoParamDto), anything())).once();
    });

    it('findCategory - empty parameter', async () => {
      const emptyParamDto: FindCategoryParamDto = {};
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([]);

      await categoryService.findCategory(emptyParamDto);
      verify(categoryRepository.findCategory(deepEqual<FindCategoryRepoParamDto>({}), anything())).once();
    });

    it('findCategory - response mapping test', async () => {
      const paramDto: FindCategoryParamDto = {};
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([{
          _id: categoryId1,
          name: categoryName1,
          level: categoryLevel1,
        } as CategoryDoc, {
          _id: categoryId2,
          name: categoryName2,
          parentCategory: {
            _id: categoryId1,
          },
          level: categoryLevel2,
        } as CategoryDoc]);

      const response: FindCategoryResponseDto = await categoryService.findCategory(paramDto);
      response.categoryList.should.have.length(2);
      response.categoryList[0]._id.should.equal(categoryId1);
      response.categoryList[0].name.should.equal(categoryName1);
      response.categoryList[0].level.should.equal(categoryLevel1);
      (response.categoryList[0].parentCategoryId === undefined).should.be.true;
      response.categoryList[1]._id.should.equal(categoryId2);
      response.categoryList[1].name.should.equal(categoryName2);
      response.categoryList[1].level.should.equal(categoryLevel2);
      response.categoryList[1].parentCategoryId!.should.equal(categoryId1);
    });
  });

  describe('createCategory test', () => {
    it('createCategory - with full parameter', async () => {
      const paramDto: CreateCategoryParamDto = {
        parentCategoryId: categoryId2,
        name: categoryName2,
      };
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([{ name: categoryName2 } as CategoryDoc]);

      const result: string = await categoryService.createCategory(paramDto);

      const [repoParamDto] = capture<CreateCategoryRepoParamDto, ClientSession>(categoryRepository.createCategory).last();
      repoParamDto.parentCategory!.should.deep.equal(new Types.ObjectId(categoryId2));
      repoParamDto.name.should.equal(categoryName2);
      result.should.equal(categoryName2);
    });

    it('createCategory - without parentCategoryId', async () => {
      const paramDto: CreateCategoryParamDto = {
        name: categoryName2,
      };
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([{ name: categoryName2 } as CategoryDoc]);

      const result: string = await categoryService.createCategory(paramDto);

      const repoParamDto: CreateCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.createCategory(deepEqual<CreateCategoryRepoParamDto>(repoParamDto), anything())).once();
      result.should.equal(categoryName2);
    });

    it('createCategory - when failed to create', async () => {
      const paramDto: CreateCategoryParamDto = {
        parentCategoryId: categoryId2,
        name: categoryName2,
      };
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_NOT_CREATED, [categoryName2, 'name']),
        (_paramDto) => categoryService.createCategory(_paramDto),
        paramDto,
      );
    });
  });

  describe('updateCategory test', () => {
    it('updateCategory - with full parameter', async () => {
      const paramDto: UpdateCategoryParamDto = {
        name: categoryName2,
        categoryToBe: {
          parentCategoryId: categoryId2,
          name: categoryName2,
        },
      };
      await categoryService.updateCategory(paramDto);

      const repoParamDto: UpdateCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.updateCategory(deepEqual(repoParamDto), anything())).once();
    });

    it('updateCategory - with empty categoryToBe', async () => {
      const paramDto: UpdateCategoryParamDto = {
        name: categoryName2,
        categoryToBe: {},
      };
      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.PARAMETER_EMPTY),
        async (_paramDto) => categoryService.updateCategory(_paramDto),
        paramDto,
      );
    });
  });

  describe('deleteCategory test', () => {
    it('category delete test', async () => {
      const paramDto: DeleteCategoryParamDto = {
        name: categoryName2,
      };
      await categoryService.deleteCategory(paramDto);

      const repoParamDto: DeleteCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.deleteCategory(deepEqual(repoParamDto), anything())).once();
    });
  });
});
