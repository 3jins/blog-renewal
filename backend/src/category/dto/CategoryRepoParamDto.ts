import { Types } from 'mongoose';

export interface FindCategoryRepoParamDto {
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
  name: string;
  categoryToBe: CategoryToBeRepoParamDto;
}

export interface DeleteCategoryRepoParamDto {
  name: string;
}
