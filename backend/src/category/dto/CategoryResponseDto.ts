export interface CategoryDto {
  name: string;
  parentCategory?: CategoryDto;
  level: number;
}

export interface FindCategoryResponseDto {
  categoryList: CategoryDto[];
}
