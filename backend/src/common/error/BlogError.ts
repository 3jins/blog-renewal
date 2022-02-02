import _ from 'lodash';
import { BlogErrorCodeFormat } from '@src/common/error/BlogErrorCode';

export default class BlogError extends Error {
  private readonly _blogErrorCode: BlogErrorCodeFormat;
  private readonly _params: string[];
  private readonly _stack?: string;

  public constructor(code: BlogErrorCodeFormat, params?: string[], message?: string) {
    super(message);
    this._blogErrorCode = code as BlogErrorCodeFormat;
    this._params = _.isEmpty(params) ? [] : params as string[];
  }

  public equals(error: any, checkMessage: boolean = true): boolean {
    if (!(error instanceof BlogError)) {
      return false;
    }
    return this.blogErrorCode === error.blogErrorCode
      && _.isEqual(this.params, error.params)
      && (checkMessage ? this.message === error.message : true)
      && this.name === error.name;
  }

  public get blogErrorCode() {
    return this._blogErrorCode;
  }

  get params(): string[] {
    return this._params;
  }

  // TODO: Cannot figure out why this function remains not tested. Improve the test code if you know the reason.
  /* istanbul ignore next */
  get stack(): string | undefined {
    /* istanbul ignore next */
    return this._stack;
  }
}
