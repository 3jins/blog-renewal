export interface FindCategoryRequestDto {
  parentCategoryId?: string;
  level?: number;
}

export interface CreateCategoryRequestDto {
  name: string;
  parentCategoryId?: string;
}

export interface CategoryToBeRequestDto {
  parentCategoryId?: string;
  name?: string;
}

export interface UpdateCategoryRequestDto {
  name: string,
  categoryToBe: CategoryToBeRequestDto;
}
