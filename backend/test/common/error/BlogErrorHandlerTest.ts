import { Context } from 'koa';
import { instance, mock } from 'ts-mockito';
import BlogErrorHandler from '@src/common/error/BlogErrorHandler';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';

export default (leaveBlogErrorLogStub) => ({
  blogErrorHandlingTest: () => {
    const blogErrorHandler: BlogErrorHandler = new BlogErrorHandler();
    const ctx: Context = instance(mock<Context>());
    const errorCode = BlogErrorCode.FILE_NOT_UPLOADED;
    const blogError = new BlogError(errorCode);

    blogErrorHandler.handleError(ctx, blogError);
    ctx.status.should.equal(errorCode.httpErrorCode);
    ctx.body.message.should.equal(errorCode.errorMessage);
    leaveBlogErrorLogStub.calledOnce.should.be.true;
  },
  normalErrorHandlingTest: () => {
    const blogErrorHandler: BlogErrorHandler = new BlogErrorHandler();
    const ctx: Context = instance(mock<Context>());
    const errorMessage = 'Task failed successfully';
    const errorCode = BlogErrorCode.UNEXPECTED_ERROR;
    const blogError = new BlogError(errorCode, [], errorMessage);

    blogErrorHandler.handleError(ctx, new Error(errorMessage));
    ctx.status.should.equal(errorCode.httpErrorCode);
    ctx.body.message.should.equal(errorCode.errorMessage);
    leaveBlogErrorLogStub.calledOnce.should.be.true;
    leaveBlogErrorLogStub.firstCall.firstArg.should.haveOwnProperty('_blogErrorCode');
    leaveBlogErrorLogStub.firstCall.firstArg.blogErrorCode.should.deep.equal(blogError.blogErrorCode);
  },
});
