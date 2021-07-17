import { JSONSchemaType } from 'ajv';

export interface FindCategoryRequestDto {
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
  name: string,
  categoryToBe: CategoryToBeRequestDto;
}

export interface DeleteCategoryRequestDto {
  name: string,
}

export const FindCategoryRequestSchema: JSONSchemaType<FindCategoryRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
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
    name: { type: 'string', nullable: false },
    categoryToBe: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true },
        parentCategoryId: { type: 'string', nullable: true },
      },
      nullable: false,
    },
  },
  required: ['name', 'categoryToBe'],
};

export const DeleteCategoryRequestSchema: JSONSchemaType<DeleteCategoryRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: false },
  },
  required: ['name'],
};
