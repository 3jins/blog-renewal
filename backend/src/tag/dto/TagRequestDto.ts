import { JSONSchemaType } from 'ajv';

export interface FindTagRequestDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
  postIdList?: string[];
  isAndCondition?: boolean;
}

export interface CreateTagRequestDto {
  name: string;
  postIdList: string[];
}

export interface TagToBeRequestDto {
  name?: string;
  postIdList?: string[];
}

export interface UpdateTagRequestDto {
  originalName: string;
  tagToBe: TagToBeRequestDto;
}

export interface DeleteTagRequestDto {
  name: string,
}

export const FindTagRequestSchema: JSONSchemaType<FindTagRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: true },
    isOnlyExactNameFound: { type: 'boolean', nullable: true },
    postIdList: { type: 'array', nullable: true, items: { type: 'string' } },
    isAndCondition: { type: 'boolean', nullable: true },
  },
};

export const CreateTagRequestSchema: JSONSchemaType<CreateTagRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: false },
    postIdList: { type: 'array', nullable: false, items: { type: 'string' } },
  },
  required: ['name', 'postIdList'],
};

export const UpdateTagRequestSchema: JSONSchemaType<UpdateTagRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    originalName: { type: 'string', nullable: false },
    tagToBe: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: true },
        postIdList: { type: 'array', nullable: true, items: { type: 'string' } },
      },
      nullable: false,
    },
  },
  required: ['originalName', 'tagToBe'],
};

export const DeleteTagRequestSchema: JSONSchemaType<DeleteTagRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: false },
  },
  required: ['name'],
};
