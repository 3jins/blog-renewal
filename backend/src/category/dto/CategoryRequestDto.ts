import { JSONSchemaType } from 'ajv';

export interface FindCategoryRequestDto {
  categoryNo?: number;
  parentCategoryId?: string;
  name?: string;
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
  categoryNo: number;
  categoryToBe: CategoryToBeRequestDto;
}

export interface DeleteCategoryRequestDto {
  categoryNo: number,
}

export const FindCategoryRequestSchema: JSONSchemaType<FindCategoryRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    categoryNo: { type: 'number', nullable: true },
    parentCategoryId: { type: 'string', nullable: true },
    name: { type: 'string', nullable: true },
    level: { type: 'number', nullable: true },
  },
};

export const CreateCategoryRequestSchema: JSONSchemaType<CreateCategoryRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: false },
    parentCategoryId: { type: 'string', nullable: true },
  },
  required: ['name'],
};

export const UpdateCategoryRequestSchema: JSONSchemaType<UpdateCategoryRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    categoryNo: { type: 'number', nullable: false },
    categoryToBe: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true },
        parentCategoryId: { type: 'string', nullable: true },
      },
      nullable: false,
    },
  },
  required: ['categoryNo', 'categoryToBe'],
};

export const DeleteCategoryRequestSchema: JSONSchemaType<DeleteCategoryRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    categoryNo: { type: 'number', nullable: false },
  },
  required: ['categoryNo'],
};
