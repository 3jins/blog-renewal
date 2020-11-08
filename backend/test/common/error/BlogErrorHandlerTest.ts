import { instance, mock, verify } from 'ts-mockito';
import { Context } from 'koa';
import BlogErrorHandler from '@src/common/error/BlogErrorHandler';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import Logger from '@src/common/logging/Logger';
import BlogError from '@src/common/error/BlogError';
import { Matcher } from 'ts-mockito/lib/matcher/type/Matcher';
import _ from 'lodash';

class BlogErrorMatcher extends Matcher {
  private blogError: any;

  public constructor(private expected: BlogError) {
    super();
  }

  match = (value: BlogError): boolean => Object.keys(value)
    .filter((fieldName) => fieldName !== '_stack')
    .map((fieldName) => _.isEqual(this.expected[fieldName], value[fieldName]))
    .reduce((prev, cur) => prev && cur);

  toString = (): string => `Did not match ${this.expected}`;
}

export default () => ({
  blogErrorHandlingTest: () => {
    const logger: Logger = mock(Logger);
    const blogErrorHandler: BlogErrorHandler = new BlogErrorHandler(instance(logger));
    const ctx: Context = instance(mock<Context>());
    const errorCode = BlogErrorCode.FILE_NOT_UPLOADED;
    const blogError = new BlogError(errorCode);

    blogErrorHandler.handleError(ctx, blogError);
    ctx.status.should.equal(errorCode.httpErrorCode);
    ctx.body.message.should.equal(errorCode.errorMessage);
    verify(logger.leaveBlogErrorLog(blogError)).once();
  },
  normalErrorHandlingTest: () => {
    const logger: Logger = mock(Logger);
    const blogErrorHandler: BlogErrorHandler = new BlogErrorHandler(instance(logger));
    const ctx: Context = instance(mock<Context>());
    const errorMessage = 'Task failed successfully';
    const errorCode = BlogErrorCode.UNEXPECTED_ERROR;
    const blogError = new BlogError(errorCode, [], errorMessage);

    blogErrorHandler.handleError(ctx, new Error(errorMessage));
    ctx.status.should.equal(errorCode.httpErrorCode);
    ctx.body.message.should.equal(errorCode.errorMessage);
    verify(logger.leaveBlogErrorLog(<any>new BlogErrorMatcher(blogError))).once();
  },
});
