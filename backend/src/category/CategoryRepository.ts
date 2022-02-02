import { Service } from 'typedi';
import { ClientSession, FilterQuery, Types, UpdateQuery } from 'mongoose';
import Category, { CategoryDoc } from '@src/category/Category';
import {
  CategoryToBeRepoParamDto,
  CreateCategoryRepoParamDto,
  DeleteCategoryRepoParamDto,
  FindCategoryRepoParamDto,
  UpdateCategoryRepoParamDto,
} from '@src/category/dto/CategoryRepoParamDto';
import _ from 'lodash';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class CategoryRepository {
  public async findCategory(paramDto: FindCategoryRepoParamDto, session: ClientSession): Promise<CategoryDoc[]> {
    const queryToFindCategory: FilterQuery<CategoryDoc> = this.makeQueryToFindCategory(paramDto);
    const categoryList = await Category
      .find(queryToFindCategory)
      .populate('parentCategory')
      .session(session)
      .lean();
    return this.filterCategoryByParentCategoryId(categoryList, paramDto.parentCategoryId);
  }

  public async createCategory(paramDto: CreateCategoryRepoParamDto, session: ClientSession) {
    const parentCategoryLevel: number = await this.findParentCategoryLevel(session, paramDto.parentCategory);
    await Category
      .insertMany({ level: parentCategoryLevel + 1, ...paramDto }, { session });
  }

  public async updateCategory(paramDto: UpdateCategoryRepoParamDto, session: ClientSession) {
    const { name, categoryToBe } = paramDto;
    const queryToUpdateCategory: UpdateQuery<CategoryDoc> = await this.makeQueryToUpdateCategory(session, categoryToBe);
    await Category
      .updateOne({ name }, queryToUpdateCategory).session(session);
  }

  public async deleteCategory(paramDto: DeleteCategoryRepoParamDto, session: ClientSession) {
    const childCategoryList: CategoryDoc[] = await this.findChildCategoryList(session, paramDto.name);
    if (!_.isEmpty(childCategoryList)) {
      throw new BlogError(
        BlogErrorCode.CATEGORY_WITH_CHILDREN_CANNOT_BE_DELETED,
        [childCategoryList.map((childCategory) => childCategory.name).join(', ')],
      );
    }
    await Category
      .deleteOne(paramDto, { session });
  }

  private makeQueryToFindCategory(paramDto: FindCategoryRepoParamDto): FilterQuery<CategoryDoc> {
    const { name, level } = paramDto;
    const queryToFindCategory: FilterQuery<CategoryDoc> = {};
    if (!_.isNil(name)) {
      Object.assign(queryToFindCategory, { name });
    }
    if (!_.isNil(level)) {
      Object.assign(queryToFindCategory, { level });
    }
    return queryToFindCategory;
  }

  private async makeQueryToUpdateCategory(session: ClientSession, categoryToBe: CategoryToBeRepoParamDto): Promise<UpdateQuery<CategoryDoc>> {
    const { parentCategoryId, name } = categoryToBe;
    const queryToUpdateCategory: UpdateQuery<CategoryDoc> = {};
    if (!_.isNil(name)) {
      Object.assign(queryToUpdateCategory, { name });
    }
    if (!_.isNil(parentCategoryId)) {
      const parentCategoryLevel: number = await this.findParentCategoryLevel(session, parentCategoryId);
      Object.assign(queryToUpdateCategory, { parentCategory: parentCategoryId, level: parentCategoryLevel + 1 });
    }
    return queryToUpdateCategory;
  }

  private filterCategoryByParentCategoryId(categoryList: FilterQuery<CategoryDoc>, parentCategoryId): CategoryDoc[] {
    return _.isNil(parentCategoryId)
      ? categoryList
      : categoryList.filter((category) => !_.isNil(category.parentCategory) && category.parentCategory._id.toString() === parentCategoryId);
  }

  private async findParentCategoryLevel(session: ClientSession, parentCategoryId?: string | Types.ObjectId): Promise<number> {
    if (_.isNil(parentCategoryId)) {
      return -1;
    }
    const parentCategoryIdString: string = parentCategoryId!.toString();
    const parentCategory: CategoryDoc | null = await Category
      .findById(parentCategoryIdString, { level: true }, { session });
    if (parentCategory === null) {
      throw new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [parentCategoryIdString, 'id']);
    }
    return parentCategory.level!;
  }

  private async findChildCategoryList(session: ClientSession, categoryName: string): Promise<CategoryDoc[]> {
    const category: (CategoryDoc | null) = await Category
      .findOne({ name: categoryName }, { _id: true, name: true }, { session });
    if (category === null) {
      throw new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [String(categoryName), 'name']);
    }
    return Category
      .find({ parentCategory: category.id }, { name: true }, { session });
  }
}
