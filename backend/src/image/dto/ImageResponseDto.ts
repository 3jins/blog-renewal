export interface ImageDto {
  title: string;
  createdDate: Date;
  size: number;
}

export interface FindImageResponseDto {
  imageList: ImageDto[];
}
