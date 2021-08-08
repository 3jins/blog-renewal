import { JSONSchemaType } from 'ajv';
import Language from '@src/common/constant/Language';

export interface CreateNewPostRequestDto {
  // post meta
  categoryName?: string;
  tagNameList?: string[];
  seriesName?: string;
  isPrivate?: boolean;
  isDraft?: boolean;

  // post
  language: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
}

export interface AddUpdatedVersionPostRequestDto {
  postNo: number;
  language: Language;
  thumbnailContent?: string;
  thumbnailImageId?: string;
}

export interface UpdatePostMetaDataRequestDto {
  postNo: number;
  categoryName?: string;
  tagNameList?: string[];
  seriesName?: string;
  isPrivate?: boolean;
  isDeprecated?: boolean;
  isDraft?: boolean;
}

export const CreateNewPostRequestSchema: JSONSchemaType<CreateNewPostRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    categoryName: { type: 'string', nullable: true },
    tagNameList: { type: 'array', nullable: true, items: { type: 'string' } },
    seriesName: { type: 'string', nullable: true },
    isPrivate: { type: 'boolean', nullable: true },
    isDraft: { type: 'boolean', nullable: true },

    language: { type: 'string', nullable: false },
    thumbnailContent: { type: 'string', nullable: true },
    thumbnailImageId: { type: 'string', nullable: true },
  },
  required: ['language'],
};

export const AddUpdatedVersionPostRequestSchema: JSONSchemaType<AddUpdatedVersionPostRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    postNo: { type: 'number', nullable: false },
    language: { type: 'string', nullable: false },
    thumbnailContent: { type: 'string', nullable: true },
    thumbnailImageId: { type: 'string', nullable: true },
  },
  required: ['postNo', 'language'],
};

export const UpdatePostMetaDataRequestSchema: JSONSchemaType<UpdatePostMetaDataRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    postNo: { type: 'number', nullable: false },
    categoryName: { type: 'string', nullable: true },
    tagNameList: { type: 'array', nullable: true, items: { type: 'string' } },
    seriesName: { type: 'string', nullable: true },
    isPrivate: { type: 'boolean', nullable: true },
    isDeprecated: { type: 'boolean', nullable: true },
    isDraft: { type: 'boolean', nullable: true },
  },
  required: ['postNo'],
};
