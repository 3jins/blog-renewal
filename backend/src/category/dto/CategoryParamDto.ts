import { Types } from 'mongoose';

export interface FindCategoryParamDto {
  categoryNo?: number;
  parentCategoryId?: string;
  name?: string;
  level?: number;
}

export interface CreateCategoryParamDto {
  parentCategoryId?: string;
  name: string;
}

export interface CategoryToBeParamDto {
  parentCategoryId?: string;
  name?: string;
}

export interface UpdateCategoryParamDto {
  categoryNo: number;
  categoryToBe: CategoryToBeParamDto;
}

export interface DeleteCategoryParamDto {
  categoryNo: number;
}
