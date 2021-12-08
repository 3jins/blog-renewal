import { should } from 'chai';
import { anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { ClientSession, Connection, Types } from 'mongoose';
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
import { common as commonTestData } from '@test/data/testData';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { abortTestTransaction, errorShouldBeThrown, replaceUseTransactionForTest } from '@test/TestUtil';
import { CategoryDoc } from '@src/category/Category';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import sinon from 'sinon';

describe('CategoryService test', () => {
  let sandbox;
  let conn: Connection;
  let session: ClientSession;
  let categoryService: CategoryService;
  let categoryRepository: CategoryRepository;

  const {
    category2: { name: categoryName, level: categoryLevel },
    objectIdList: [categoryId],
  } = commonTestData;

  before(() => {
    categoryRepository = spy(mock(CategoryRepository));
    categoryService = new CategoryService(instance(categoryRepository));
    should();
    setConnection();
    conn = getConnection();
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
  });

  describe('findCategory test', () => {
    it('findCategory - full parameter', () => {
      const nameOnlyParamDto: FindCategoryParamDto = {
        parentCategoryId: categoryId,
        name: categoryName,
        level: categoryLevel,
      };
      categoryService.findCategory(nameOnlyParamDto);
      const repoParamDto: FindCategoryRepoParamDto = { ...nameOnlyParamDto };
      verify(categoryRepository.findCategory(deepEqual<FindCategoryRepoParamDto>(repoParamDto), anything())).once();
    });

    it('findCategory - empty parameter', () => {
      const emptyParamDto: FindCategoryParamDto = {};
      categoryService.findCategory(emptyParamDto);
      verify(categoryRepository.findCategory(deepEqual<FindCategoryRepoParamDto>({}), anything())).once();
    });
  });

  describe('createCategory test', () => {
    it('createCategory - with full parameter', async () => {
      const paramDto: CreateCategoryParamDto = {
        parentCategoryId: categoryId,
        name: categoryName,
      };
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([{ name: categoryName } as CategoryDoc]);

      const result: string = await categoryService.createCategory(paramDto);

      const [repoParamDto] = capture<CreateCategoryRepoParamDto, ClientSession>(categoryRepository.createCategory).last();
      repoParamDto.parentCategory!.should.deep.equal(new Types.ObjectId(categoryId));
      repoParamDto.name.should.equal(categoryName);
      result.should.equal(categoryName);
    });

    it('createCategory - without parentCategoryId', async () => {
      const paramDto: CreateCategoryParamDto = {
        name: categoryName,
      };
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([{ name: categoryName } as CategoryDoc]);

      const result: string = await categoryService.createCategory(paramDto);

      const repoParamDto: CreateCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.createCategory(deepEqual<CreateCategoryRepoParamDto>(repoParamDto), anything())).once();
      result.should.equal(categoryName);
    });

    it('createCategory - when failed to create', async () => {
      const paramDto: CreateCategoryParamDto = {
        parentCategoryId: categoryId,
        name: categoryName,
      };
      when(categoryRepository.findCategory(anything(), anything()))
        .thenResolve([]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_NOT_CREATED, [categoryName, 'name']),
        (_paramDto) => categoryService.createCategory(_paramDto),
        paramDto,
      );
    });
  });

  describe('updateCategory test', () => {
    it('updateCategory - with full parameter', async () => {
      const paramDto: UpdateCategoryParamDto = {
        name: categoryName,
        categoryToBe: {
          parentCategoryId: categoryId,
          name: categoryName,
        },
      };
      await categoryService.updateCategory(paramDto);

      const repoParamDto: UpdateCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.updateCategory(deepEqual(repoParamDto), anything())).once();
    });

    it('updateCategory - with empty categoryToBe', async () => {
      const paramDto: UpdateCategoryParamDto = {
        name: categoryName,
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
        name: categoryName,
      };
      await categoryService.deleteCategory(paramDto);

      const repoParamDto: DeleteCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.deleteCategory(deepEqual(repoParamDto), anything())).once();
    });
  });
});
