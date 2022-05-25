export interface CategoryDto {
  _id: string;
  name: string;
  parentCategoryId?: string;
  level: number;
}

export interface CategoryResponseDto {
  categoryList: CategoryDto[];
}
