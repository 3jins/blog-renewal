import { should } from 'chai';
import BlogErrorTest from './BlogErrorCodeTest';
import BlogErrorHandlerTest from './BlogErrorHandlerTest';

describe('error test', () => {
  before(() => should());

  describe('BlogErrorCode test', () => {
    it('BlogErrorCode key code matching test', () => BlogErrorTest().keyCodeMatchingTest());
  });

  describe('BlogErrorHandler test', () => {
    it('handleError handling a BlogErrorCode test', () => BlogErrorHandlerTest().blogErrorHandlingTest());
    it('handleError handling a normal error test', () => BlogErrorHandlerTest().normalErrorHandlingTest());
  });
});
