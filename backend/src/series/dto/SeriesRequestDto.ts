import { JSONSchemaType } from 'ajv';

export interface FindSeriesRequestDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
}

export interface CreateSeriesRequestDto {
  name: string;
  thumbnailContent: string;
  thumbnailImage?: string;
  postIdList?: string[];
}

export interface SeriesToBeRequestDto {
  name?: string;
  thumbnailContent?: string;
  thumbnailImage?: string;
  postIdToBeAddedList?: string[];
  postIdToBeRemovedList?: string[];
}

export interface UpdateSeriesRequestDto {
  originalName: string;
  seriesToBe: SeriesToBeRequestDto;
}

export interface DeleteSeriesRequestDto {
  name: string,
}

export const FindSeriesRequestSchema: JSONSchemaType<FindSeriesRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: true },
    isOnlyExactNameFound: { type: 'boolean', nullable: true },
  },
};

export const CreateSeriesRequestSchema: JSONSchemaType<CreateSeriesRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: false },
    postIdList: { type: 'array', nullable: true, items: { type: 'string' } },
    thumbnailContent: { type: 'string', nullable: false },
    thumbnailImage: { type: 'string', nullable: true },
  },
  required: ['name', 'thumbnailContent'],
};

export const UpdateSeriesRequestSchema: JSONSchemaType<UpdateSeriesRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    originalName: { type: 'string', nullable: false },
    seriesToBe: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true },
        postIdToBeAddedList: { type: 'array', nullable: true, items: { type: 'string' } },
        postIdToBeRemovedList: { type: 'array', nullable: true, items: { type: 'string' } },
        thumbnailContent: { type: 'string', nullable: true },
        thumbnailImage: { type: 'string', nullable: true },
      },
      nullable: false,
    },
  },
  required: ['originalName', 'seriesToBe'],
};

export const DeleteSeriesRequestSchema: JSONSchemaType<DeleteSeriesRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: false },
  },
  required: ['name'],
};
