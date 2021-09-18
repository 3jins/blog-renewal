import Ajv, { Schema, JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

export const getValidatedRequestDtoOf = <T>(schema: Schema | JSONSchemaType<T>, requestBody: T): T => {
  const ajv = new Ajv({ coerceTypes: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(requestBody)) {
    throw new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, [JSON.stringify(requestBody)], JSON.stringify(validate.errors));
  }
  return requestBody;
};
