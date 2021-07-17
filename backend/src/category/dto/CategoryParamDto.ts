export interface FindCategoryParamDto {
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
  name: string;
  categoryToBe: CategoryToBeParamDto;
}

export interface DeleteCategoryParamDto {
  name: string;
}
