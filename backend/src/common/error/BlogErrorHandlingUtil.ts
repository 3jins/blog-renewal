import { ExtendableContext } from 'koa';
import { leaveBlogErrorLog } from '@src/common/logging/LoggingUtil';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

export const handleError = (ctx: ExtendableContext, error: Error) => {
  const blogError: BlogError = error instanceof BlogError
    ? error as BlogError
    : new BlogError(BlogErrorCode.UNEXPECTED_ERROR, [], error.toString());
  const { blogErrorCode: { httpErrorCode, errorMessage } } = blogError;
  ctx.status = httpErrorCode;
  ctx.body = { message: errorMessage };
  leaveBlogErrorLog(blogError);
};
