import _ from 'lodash';
import { BlogErrorCode, BlogErrorCodeFormat } from '@src/common/error/BlogErrorCode';

export default class BlogError extends Error {
  private readonly _blogErrorCode: BlogErrorCodeFormat;
  private readonly _params: string[];
  private readonly _stack?: string;

  public constructor(code: BlogErrorCodeFormat, params?: string[], message?: string) {
    super(message);
    this._blogErrorCode = _.isEmpty(code) ? BlogErrorCode.UNEXPECTED_ERROR : code as BlogErrorCodeFormat;
    this._params = _.isEmpty(params) ? [] : params as string[];
  }

  public get blogErrorCode() {
    return this._blogErrorCode;
  }

  get params(): string[] {
    return this._params;
  }

  get stack(): string | undefined {
    return this._stack;
  }
}
