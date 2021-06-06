import { Schema } from 'ajv/lib/types/index';
import { JSONSchemaType } from 'ajv/lib/types/json-schema';
import Ajv from 'ajv';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

export const getValidatedRequestDtoOf = <T>(schema: Schema | JSONSchemaType<T>, requestBody: T): T => {
  const ajv = new Ajv({ coerceTypes: true });
  const validate = ajv.compile(schema);
  if (!validate(requestBody)) {
    throw new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, [JSON.stringify(requestBody)], JSON.stringify(validate.errors));
  }
  return requestBody;
};
