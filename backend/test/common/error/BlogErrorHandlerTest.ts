import BlogErrorHandler from '../../../src/common/error/BlogErrorHandler';
import { Context } from 'koa';
import { BlogError } from '../../../src/common/error/BlogError';
import { anyString, instance, mock, verify } from 'ts-mockito';
import Logger from '../../../src/common/logging/Logger';
import LogLevel from '../../../src/common/logging/LogLevel';

export default () => ({
  blogErrorHandlingTest: () => {
    const logger: Logger = mock(Logger);
    const blogErrorHandler: BlogErrorHandler = new BlogErrorHandler(instance(logger));
    const ctx: Context = instance(mock<Context>());

    blogErrorHandler.handleError(ctx, new Error(BlogError.FILE_NOT_UPLOADED.code));
    verify(logger.leaveLog(BlogError.FILE_NOT_UPLOADED.logLevel, BlogError.FILE_NOT_UPLOADED.errorMessage, anyString())).once();
  },
  normalErrorHandlingTest: () => {
    const logger: Logger = mock(Logger);
    const blogErrorHandler: BlogErrorHandler = new BlogErrorHandler(instance(logger));
    const ctx: Context = instance(mock<Context>());
    const errorMessage = 'Task failed successfully';

    blogErrorHandler.handleError(ctx, new Error(errorMessage));
    verify(logger.leaveLog(LogLevel.ERROR, errorMessage, anyString())).once();
  },
});
