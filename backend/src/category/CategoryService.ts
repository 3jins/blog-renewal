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

@Service()
export default class CategoryService {
  public constructor(private readonly categoryRepository: CategoryRepository) {
  }

  public findCategory(paramDto: FindCategoryParamDto): Promise<CategoryDoc[]> {
    return useTransaction(async (session: ClientSession) => this.categoryRepository
      .findCategory({ ...paramDto }, session));
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

  private makeCreateCategoryRepoParamDto(paramDto: CreateCategoryParamDto): CreateCategoryRepoParamDto {
    const { parentCategoryId } = paramDto;
    const repoParamDto: CreateCategoryRepoParamDto = { ...paramDto };
    if (!_.isNil(parentCategoryId)) {
      Object.assign(repoParamDto, { parentCategory: new Types.ObjectId(parentCategoryId) });
    }
    return repoParamDto;
  }
}
