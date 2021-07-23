import { JSONSchemaType } from 'ajv';
import Language from '@src/common/constant/Language';

export interface CreateNewPostRequestDto {
  // post meta
  categoryName?: string;
  tagNameList?: string[];
  seriesName?: string;
  isPrivate?: boolean;

  // post
  language: Language;
  thumbnailContent: string;
  thumbnailImageId?: string;
}

export const CreateNewPostRequestSchema: JSONSchemaType<CreateNewPostRequestDto> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    categoryName: { type: 'string', nullable: true },
    tagNameList: { type: 'array', nullable: true, items: { type: 'string' } },
    seriesName: { type: 'string', nullable: true },
    isPrivate: { type: 'boolean', nullable: true },

    language: { type: 'string', nullable: false },
    thumbnailContent: { type: 'string', nullable: false },
    thumbnailImageId: { type: 'string', nullable: true },
  },
  required: ['language', 'thumbnailContent'],
};
