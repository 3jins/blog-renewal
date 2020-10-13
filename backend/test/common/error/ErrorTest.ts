import { should } from 'chai';
import BlogErrorTest from './BlogErrorTest';
import BlogErrorHandlerTest from './BlogErrorHandlerTest';

describe('error test', () => {
  before(() => should());

  describe('BlogError test', () => {
    it('BlogError key code matching test', () => BlogErrorTest().keyCodeMatchingTest());
  });

  describe('BlogErrorHandler test', () => {
    it('handleError handling a BlogError test', () => BlogErrorHandlerTest().blogErrorHandlingTest());
    it('handleError handling a normal error test', () => BlogErrorHandlerTest().normalErrorHandlingTest());
  });
});
