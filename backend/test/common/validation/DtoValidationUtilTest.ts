import { should } from 'chai';
import { getValidatedRequestDtoOf } from '@src/common/validation/DtoValidationUtil';
import { errorShouldBeThrownWithMessageCheck, parameterizedTest } from '@test/TestUtil';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import Language from '@common/constant/Language';

describe('DtoValidationUtil test', () => {
  before(() => {
    should();
  });

  describe('getValidatedRequestDtoOf test', () => {
    const schema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        categoryName: {
          type: 'string',
          nullable: true,
        },
        tagNameList: {
          type: 'array',
          nullable: true,
          items: {
            type: 'string',
          },
        },
        isPrivate: {
          type: 'boolean',
          nullable: true,
        },
        language: {
          type: 'string',
          nullable: false,
        },
      },
      required: [
        'language',
      ],
    };

    it('getValidatedRequestDtoOf - required field missing', async () => {
      await errorShouldBeThrownWithMessageCheck(
        new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, ['{}']),
        (_schema, _requestBody) => getValidatedRequestDtoOf(_schema, _requestBody),
        (message) => message.should.contain('"missingProperty":"language"'),
        schema,
        {},
      );
    });

    context('with variant language field', () => parameterizedTest(
      'returns proper parsed request body',
      [
        { language: 'ko' },
        { language: '"ko"' },
        { language: '\\"ko\\"' },
        { language: '"\\"ko\\""' },
      ],
      (requestBody: object) => {
        const parsedRequestBody: object = getValidatedRequestDtoOf(schema, requestBody);
        parsedRequestBody.should.deep.equal({ language: Language.KO });
      },
    ));

    context('with variant tagNameList field', () => parameterizedTest(
      'returns proper parsed request body',
      [
        { tagNameList: ['밤편지', 'IU'], language: 'ko' },
        { tagNameList: '["밤편지","IU"]', language: 'ko' },
        { tagNameList: '[\\"밤편지\\",\\"IU\\"]', language: 'ko' },
        { tagNameList: '["\\"밤편지\\"","\\"IU\\""]', language: 'ko' },
      ],
      (requestBody: object) => {
        const parsedRequestBody: object = getValidatedRequestDtoOf(schema, requestBody);
        parsedRequestBody.should.deep.equal({ tagNameList: ['밤편지', 'IU'], language: Language.KO });
      },
    ));
  });
});
