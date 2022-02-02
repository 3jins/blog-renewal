import _ from 'lodash';
import { Service } from 'typedi';
import { ClientSession, Types } from 'mongoose';
import {
  CreateCategoryParamDto,
  DeleteCategoryParamDto,
  FindCategoryParamDto,
  UpdateCategoryParamDto,
} from '@src/category/dto/CategoryParamDto';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import CategoryRepository from '@src/category/CategoryRepository';
import { CategoryDoc } from '@src/category/Category';
import { CreateCategoryRepoParamDto } from '@src/category/dto/CategoryRepoParamDto';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import { CategoryDto, FindCategoryResponseDto } from '@src/category/dto/CategoryResponseDto';

@Service()
export default class CategoryService {
  public constructor(private readonly categoryRepository: CategoryRepository) {
  }

  public findCategory(paramDto: FindCategoryParamDto): Promise<FindCategoryResponseDto> {
    return useTransaction(async (session: ClientSession) => {
      const categoryDocList: CategoryDoc[] = await this.categoryRepository
        .findCategory({ ...paramDto }, session);
      return {
        categoryList: categoryDocList.map((categoryDoc: CategoryDoc) => this.convertToCategoryDto(categoryDoc)),
      };
    });
  }

  public createCategory(paramDto: CreateCategoryParamDto): Promise<string> {
    return useTransaction(async (session: ClientSession) => {
      const repoParamDto: CreateCategoryRepoParamDto = this.makeCreateCategoryRepoParamDto(paramDto);
      await this.categoryRepository
        .createCategory(repoParamDto, session);

      const categoryList: CategoryDoc[] = await this.categoryRepository.findCategory({ name: paramDto.name }, session);
      if (_.isEmpty(categoryList)) {
        throw new BlogError(BlogErrorCode.CATEGORY_NOT_CREATED, [paramDto.name, 'name']);
      }
      return categoryList[0].name;
    });
  }

  public updateCategory(paramDto: UpdateCategoryParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      if (_.isNil(paramDto.categoryToBe) || _.isEmpty(_.values(paramDto.categoryToBe))) {
        throw new BlogError(BlogErrorCode.PARAMETER_EMPTY);
      }
      return this.categoryRepository.updateCategory({ ...paramDto }, session);
    });
  }

  public deleteCategory(paramDto: DeleteCategoryParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => this.categoryRepository
      .deleteCategory({ ...paramDto }, session));
  }

  private convertToCategoryDto(categoryDoc: CategoryDoc): CategoryDto {
    const { _id, name, level, parentCategory } = categoryDoc;
    const categoryDto: CategoryDto = {
      id: _id,
      name,
      level: level!,
    };
    if (!_.isNil(parentCategory)) {
      Object.assign(categoryDto, { parentCategoryId: parentCategory._id });
    }
    return categoryDto;
  }

  private makeCreateCategoryRepoParamDto(paramDto: CreateCategoryParamDto): CreateCategoryRepoParamDto {
    const { parentCategoryId } = paramDto;
    const repoParamDto: CreateCategoryRepoParamDto = { ...paramDto };
    if (!_.isNil(parentCategoryId)) {
      Object.assign(repoParamDto, { parentCategory: new Types.ObjectId(parentCategoryId) });
    }
    return repoParamDto;
  }
}
