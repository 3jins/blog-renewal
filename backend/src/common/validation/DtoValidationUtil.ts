import _ from 'lodash';
import Ajv, { JSONSchemaType, Schema } from 'ajv';
import addFormats from 'ajv-formats';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

const stripWrappingDoubleQuotes = (value: string): string => {
  if (_.startsWith(value, '"') && _.endsWith(value, '"')) {
    return stripWrappingDoubleQuotes(value.substr(1, value.length - 2));
  }
  if (_.startsWith(value, '\\"') && _.endsWith(value, '\\"')) {
    return stripWrappingDoubleQuotes(value.substr(2, value.length - 4));
  }
  return value;
};

const isArraySchemaProperty = <T>(propertyName: string, schema: JSONSchemaType<T>): boolean => (
  schema.properties[propertyName] !== undefined
  && schema.properties[propertyName].type === 'array'
  && !Array.isArray(schema.properties[propertyName].value)
);

const parseArrayStringFields = <T>(requestBody: object, schema: JSONSchemaType<T>): object => Object.fromEntries(
  Object.entries(requestBody)
    .map(([key, value]: [string, any]) => {
      if (typeof value === 'object') {
        return [key, value];
      }
      const cleanedValueString: string = stripWrappingDoubleQuotes(value as string);
      if (isArraySchemaProperty(key, schema)) {
        if (_.startsWith(cleanedValueString, '[') && _.endsWith(cleanedValueString, ']')) {
          const strippedValue = cleanedValueString.substr(1, cleanedValueString.length - 2);
          return [
            key,
            strippedValue === ''
              ? []
              : _.split(strippedValue, ',').map((element) => stripWrappingDoubleQuotes(element)),
          ];
        }
      }
      return [key, cleanedValueString];
    }),
);

export const getValidatedRequestDtoOf = <T>(schema: Schema | JSONSchemaType<T>, requestBody: object): T => {
  const ajv = new Ajv({ coerceTypes: true });
  addFormats(ajv);
  const parsedRequestBody = parseArrayStringFields(requestBody, schema as JSONSchemaType<T>);
  const validate = ajv.compile(schema);
  if (!validate(parsedRequestBody)) {
    throw new BlogError(BlogErrorCode.INVALID_REQUEST_PARAMETER, [JSON.stringify(parsedRequestBody)], JSON.stringify(validate.errors));
  }
  return parsedRequestBody;
};
