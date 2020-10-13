import _ from 'lodash';
import { Context } from 'koa';
import { BlogError } from './BlogError';
import Logger from '../logging/Logger';
import LogLevel from '../logging/LogLevel';
import { Service } from 'typedi';

interface BlogErrorFormat {
  blogErrorCode: string,
  errorMessage: string,
  httpErrorCode: number,
  logLevel: LogLevel,
}

@Service()
export default class BlogErrorHandler {
  public constructor(private readonly _logger: Logger) {
  }

  public handleError(ctx: Context, err: Error) {
    const { message, stack } = err;
    if (_.has(BlogError, message)) {
      this._handleBlogError(ctx, BlogError[message], stack);
    } else {
      this._handleNormalError(ctx, message, stack);
    }
  }

  private _handleBlogError(ctx: Context, blogError: BlogErrorFormat, stack?: string): void {
    const { httpErrorCode, errorMessage, logLevel } = blogError;
    ctx.status = httpErrorCode;
    ctx.body = {
      message: errorMessage,
    };
    this._logger.leaveLog(logLevel, errorMessage, stack);
  };

  private _handleNormalError(ctx: Context, message: string, stack?: string): void {
    ctx.status = 500;
    ctx.body = { message };
    this._logger.leaveLog(LogLevel.ERROR, message, stack);
  }
}
