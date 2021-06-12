import { Types } from 'mongoose';

export interface FindCategoryRepoParamDto {
  categoryNo?: number;
  parentCategoryId?: string;
  name?: string;
  level?: number;
}

export interface CreateCategoryRepoParamDto {
  parentCategory?: Types.ObjectId;
  name: string;
}

export interface CategoryToBeRepoParamDto {
  parentCategoryId?: string;
  name?: string;
}

export interface UpdateCategoryRepoParamDto {
  categoryNo: number;
  categoryToBe: CategoryToBeRepoParamDto;
}

export interface DeleteCategoryRepoParamDto {
  categoryNo: number;
}
