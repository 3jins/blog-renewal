import { JSONSchemaType } from 'ajv';

export interface FindTagRequestDto {
  name?: string;
  isOnlyExactNameFound?: boolean;
  postMetaIdList?: string[];
  isAndCondition?: boolean;
}

export interface CreateTagRequestDto {
  name: string;
  postMetaIdList?: string[];
}

export interface TagToBeRequestDto {
  name?: string;
  postMetaIdToBeAddedList?: string[];
  postMetaIdToBeRemovedList?: string[];
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
    postMetaIdList: { type: 'array', nullable: true, items: { type: 'string' } },
    isAndCondition: { type: 'boolean', nullable: true },
  },
};

export const CreateTagRequestSchema: JSONSchemaType<CreateTagRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', nullable: false },
    postMetaIdList: { type: 'array', nullable: true, items: { type: 'string' } },
  },
  required: ['name'],
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
        postMetaIdToBeAddedList: { type: 'array', nullable: true, items: { type: 'string' } },
        postMetaIdToBeRemovedList: { type: 'array', nullable: true, items: { type: 'string' } },
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
