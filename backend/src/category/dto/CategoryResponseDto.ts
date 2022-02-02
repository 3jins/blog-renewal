export interface CategoryDto {
  id: string;
  name: string;
  parentCategoryId?: string;
  level: number;
}

export interface FindCategoryResponseDto {
  categoryList: CategoryDto[];
}
