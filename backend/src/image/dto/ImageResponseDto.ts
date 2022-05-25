export interface ImageDto {
  title: string;
  createdDate: Date;
  size: number;
  uri: string;
}

export interface FindImageResponseDto {
  imageList: ImageDto[];
}
