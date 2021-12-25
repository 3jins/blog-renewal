import { Context } from 'koa';
import { instance, mock } from 'ts-mockito';
import sinon from 'sinon';
import { should } from 'chai';
import { handleError } from '@src/common/error/BlogErrorHandlingUtil';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import * as LoggingUtil from '@src/common/logging/LoggingUtil';

describe('BlogErrorHandler test', () => {
  let sandbox;
  let leaveBlogErrorLogStub;

  before(() => {
    should();
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    leaveBlogErrorLogStub = sandbox.stub(LoggingUtil, 'leaveBlogErrorLog');
  });

  afterEach(() => sandbox.restore());

  it('handleError handling a BlogErrorCode test', () => {
    const ctx: Context = instance(mock<Context>());
    const errorCode = BlogErrorCode.FILE_NOT_UPLOADED;
    const blogError = new BlogError(errorCode);

    handleError(ctx, blogError);
    ctx.status.should.equal(errorCode.httpErrorCode);
    // @ts-ignore
    ctx.body.message.should.equal(errorCode.errorMessage);
    leaveBlogErrorLogStub.calledOnce.should.be.true;
    leaveBlogErrorLogStub.firstCall.firstArg.should.haveOwnProperty('_blogErrorCode');
    leaveBlogErrorLogStub.firstCall.firstArg.blogErrorCode.should.deep.equal(blogError.blogErrorCode);
  });
  it('handleError handling a normal error test', () => {
    const ctx: Context = instance(mock<Context>());
    const errorMessage = 'Task failed successfully';
    const errorCode = BlogErrorCode.UNEXPECTED_ERROR;
    const blogError = new BlogError(errorCode, [], errorMessage);

    handleError(ctx, new Error(errorMessage));
    ctx.status.should.equal(errorCode.httpErrorCode);
    // @ts-ignore
    ctx.body.message.should.equal(errorCode.errorMessage);
    leaveBlogErrorLogStub.calledOnce.should.be.true;
    leaveBlogErrorLogStub.firstCall.firstArg.should.haveOwnProperty('_blogErrorCode');
    leaveBlogErrorLogStub.firstCall.firstArg.blogErrorCode.should.deep.equal(blogError.blogErrorCode);
  });
});
