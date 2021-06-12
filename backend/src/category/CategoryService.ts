import _ from 'lodash';
import { Service } from 'typedi';
import { Types } from 'mongoose';
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

@Service()
export default class CategoryService {
  public constructor(private readonly categoryRepository: CategoryRepository) {
  }

  public findCategory = async (paramDto: FindCategoryParamDto): Promise<CategoryDoc[]> => this.categoryRepository
    .findCategory({ ...paramDto });

  public createCategory = async (paramDto: CreateCategoryParamDto): Promise<void> => {
    const repoParamDto: CreateCategoryRepoParamDto = this.makeCreateCategoryRepoParamDto(paramDto);
    return this.categoryRepository
      .createCategory(repoParamDto);
  };

  public updateCategory = async (paramDto: UpdateCategoryParamDto): Promise<void> => {
    if (_.isNil(paramDto.categoryToBe) || _.isEmpty(_.values(paramDto.categoryToBe))) {
      throw new BlogError(BlogErrorCode.PARAMETER_EMPTY);
    }
    return this.categoryRepository.updateCategory({
      ...paramDto,
    });
  };

  public deleteCategory = async (paramDto: DeleteCategoryParamDto): Promise<void> => this.categoryRepository
    .deleteCategory({ ...paramDto });

  private makeCreateCategoryRepoParamDto = (paramDto: CreateCategoryParamDto) => {
    const { parentCategoryId } = paramDto;
    const repoParamDto: CreateCategoryRepoParamDto = { ...paramDto };
    if (!_.isNil(parentCategoryId)) {
      Object.assign(repoParamDto, { parentCategory: new Types.ObjectId(parentCategoryId) });
    }
    return repoParamDto;
  };
}
