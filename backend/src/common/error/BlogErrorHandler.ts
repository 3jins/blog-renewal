import { Context } from 'koa';
import { Service } from 'typedi';
import Logger from '@src/common/logging/Logger';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class BlogErrorHandler {
  public constructor(private readonly _logger: Logger) {
  }

  public handleError(ctx: Context, error: Error) {
    const blogError: BlogError = error instanceof BlogError ? error as BlogError : new BlogError(BlogErrorCode.UNEXPECTED_ERROR, [], error.message);
    const { blogErrorCode: { httpErrorCode, errorMessage } } = blogError;
    ctx.status = httpErrorCode;
    ctx.body = { message: errorMessage };
    this._logger.leaveBlogErrorLog(blogError);
  }
}
