import { should } from 'chai';
import sinon from 'sinon';
import * as LoggingUtil from '@src/common/logging/LoggingUtil';
import BlogErrorTest from './BlogErrorCodeTest';
import BlogErrorHandlerTest from './BlogErrorHandlerTest';

describe('error test', () => {
  before(() => should());

  describe('BlogErrorCode test', () => {
    it('BlogErrorCode key code matching test', () => BlogErrorTest().keyCodeMatchingTest());
  });

  describe('BlogErrorHandler test', () => {
    let sandbox;
    let leaveBlogErrorLogStub;
    let blogErrorHandlerTest;

    before(() => {
      sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
      leaveBlogErrorLogStub = sandbox.stub(LoggingUtil, 'leaveBlogErrorLog');
      blogErrorHandlerTest = BlogErrorHandlerTest(leaveBlogErrorLogStub);
    });

    afterEach(() => sandbox.restore());

    it('handleError handling a BlogErrorCode test', () => blogErrorHandlerTest.blogErrorHandlingTest());
    it('handleError handling a normal error test', () => blogErrorHandlerTest.normalErrorHandlingTest());
  });
});
