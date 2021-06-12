import { should } from 'chai';
import { capture, deepEqual, instance, mock, spy, verify } from 'ts-mockito';
import { Types } from 'mongoose';
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
import { errorShouldBeThrown } from '@test/TestUtil';

describe('CategoryService test', () => {
  let categoryService: CategoryService;
  let categoryRepository: CategoryRepository;

  const {
    category2: { categoryNo, name: categoryName, level: categoryLevel },
    objectIdList: [categoryId],
  } = commonTestData;

  before(() => {
    categoryRepository = spy(mock(CategoryRepository));
    categoryService = new CategoryService(instance(categoryRepository));
    should();
  });

  describe('findCategory test', () => {
    it('findCategory - full parameter', () => {
      const nameOnlyParamDto: FindCategoryParamDto = {
        categoryNo,
        parentCategoryId: categoryId,
        name: categoryName,
        level: categoryLevel,
      };
      categoryService.findCategory(nameOnlyParamDto);
      const repoParamDto: FindCategoryRepoParamDto = { ...nameOnlyParamDto };
      verify(categoryRepository.findCategory(deepEqual<FindCategoryRepoParamDto>(repoParamDto))).once();
    });

    it('findCategory - empty parameter', () => {
      const emptyParamDto: FindCategoryParamDto = {};
      categoryService.findCategory(emptyParamDto);
      verify(categoryRepository.findCategory(deepEqual<FindCategoryRepoParamDto>({}))).once();
    });
  });

  describe('createCategory test', () => {
    it('createCategory - with full parameter', async () => {
      const paramDto: CreateCategoryParamDto = {
        parentCategoryId: categoryId,
        name: categoryName,
      };
      await categoryService.createCategory(paramDto);

      const [repoParamDto] = capture<CreateCategoryRepoParamDto>(categoryRepository.createCategory).last();
      repoParamDto.parentCategory!.should.deep.equal(new Types.ObjectId(categoryId));
      repoParamDto.name.should.equal(categoryName);
    });

    it('createCategory - without parentCategoryId', async () => {
      const paramDto: CreateCategoryParamDto = {
        name: categoryName,
      };
      await categoryService.createCategory(paramDto);

      const repoParamDto: CreateCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.createCategory(deepEqual<CreateCategoryRepoParamDto>(repoParamDto))).once();
    });
  });

  describe('updateCategory test', () => {
    it('updateCategory - with full parameter', async () => {
      const paramDto: UpdateCategoryParamDto = {
        categoryNo,
        categoryToBe: {
          parentCategoryId: categoryId,
          name: categoryName,
        },
      };
      await categoryService.updateCategory(paramDto);

      const repoParamDto: UpdateCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.updateCategory(deepEqual(repoParamDto))).once();
    });

    it('updateCategory - with empty categoryToBe', async () => {
      const paramDto: UpdateCategoryParamDto = {
        categoryNo,
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
        categoryNo,
      };
      await categoryService.deleteCategory(paramDto);

      const repoParamDto: DeleteCategoryRepoParamDto = { ...paramDto };
      verify(categoryRepository.deleteCategory(deepEqual(repoParamDto))).once();
    });
  });
});
