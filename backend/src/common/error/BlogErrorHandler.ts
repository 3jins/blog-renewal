import _ from 'lodash';
import { Context } from 'koa';
import { Service } from 'typedi';
import { BlogError } from './BlogError';
import Logger from '@src/common/logging/Logger';
import LogLevel from '@src/common/logging/LogLevel';

interface BlogErrorFormat {
  blogErrorCode: string,
  errorMessage: string,
  httpErrorCode: number,
  logLevel: LogLevel,
}

@Service()
export default class BlogErrorHandler {
  public constructor(private readonly logger: Logger) {}

  public handleError(ctx: Context, err: Error) {
    const { message, stack } = err;
    if (_.has(BlogError, message)) {
      this.handleBlogError(ctx, BlogError[message], stack);
    } else {
      this.handleNormalError(ctx, message, stack);
    }
  }

  private handleBlogError(ctx: Context, blogError: BlogErrorFormat, stack?: string): void {
    const { httpErrorCode, errorMessage, logLevel } = blogError;
    ctx.status = httpErrorCode;
    ctx.body = {
      message: errorMessage,
    };
    this.logger.leaveLog(logLevel, errorMessage, stack);
  }

  private handleNormalError(ctx: Context, message: string, stack?: string): void {
    ctx.status = 500;
    ctx.body = { message };
    this.logger.leaveLog(LogLevel.ERROR, message, stack);
  }
}
