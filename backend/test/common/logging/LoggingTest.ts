import { should } from 'chai';
import sinon from 'sinon';
import { blogErrorCode as dummyBlogErrorCode } from '@test/data/testData';
import LoggingUtilTest from './LoggingUtilTest';

describe('logging test', () => {
  before(() => should());

  describe('Logger test', () => {
    let sandbox;
    let loggingUtilTest;

    before(() => {
      sandbox = sinon.createSandbox();
      loggingUtilTest = LoggingUtilTest(sandbox, dummyBlogErrorCode);
    });

    afterEach(() => sandbox.restore());

    it('call Logger.leaveBlogErrorLog with MUTE option', () => loggingUtilTest.leaveMuteLogTest());
    it('call Logger.leaveBlogErrorLog with DEBUG option', () => loggingUtilTest.leaveDebugLogTest());
    it('call Logger.leaveBlogErrorLog with INFO option', () => loggingUtilTest.leaveInfoLogTest());
    it('call Logger.leaveBlogErrorLog with WARN option', () => loggingUtilTest.leaveWarnLogTest());
    it('call Logger.leaveBlogErrorLog with ERROR option', () => loggingUtilTest.leaveErrorLogTest());
    it('call Logger.leaveBlogErrorLog with DEFAULT option', () => loggingUtilTest.leaveDefaultLogTest());
    it('call Logger.leaveBlogErrorLog with parameters', () => loggingUtilTest.leaveLogForErrorWithParametersTest());
  });
});
