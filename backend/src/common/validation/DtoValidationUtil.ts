import _ from 'lodash';
import Ajv, { Schema, JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

const parseArrayStringFields = (requestBody: Object): Object => Object.fromEntries(Object.entries(requestBody)
  .map(([key, value]) => {
    if (_.isString(value) && value.startsWith('[') && value.endsWith(']')) {
      return [key, JSON.parse(value)];
    }
    return [key, value];
  }));

export const getValidatedRequestDtoOf = <T>(schema: Schema | JSONSchemaType<T>, requestBody: Object): T => {
  const ajv = new Ajv({ coerceTypes: true });
  addFormats(ajv);
  const parsedRequestBody = parseArrayStringFields(requestBody);
  const validate = ajv.compile(schema);
  if (!validate(parsedRequestBody)) {
    throw new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, [JSON.stringify(parsedRequestBody)], JSON.stringify(validate.errors));
  }
  return parsedRequestBody;
};
