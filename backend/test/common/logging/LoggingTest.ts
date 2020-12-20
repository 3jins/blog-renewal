import { should } from 'chai';
import sinon from 'sinon';
import { blogErrorCode as dummyBlogErrorCode } from '@test/data/testData';
import LoggingUtilTest from './LoggingUtilTest';
import Logger from '@src/common/logging/Logger';
import { leaveLog } from '@src/common/logging/LoggingUtil';
import LogLevel from '@src/common/logging/LogLevel';

describe('logging test', () => {
  before(() => should());

  describe('Logger test', () => {
    let sandbox;
    let loggingUtilTest;
    let loggerStub;

    before(() => {
      sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
      loggerStub = sandbox.stub(Logger);
      loggingUtilTest = LoggingUtilTest(loggerStub, dummyBlogErrorCode);
    });

    afterEach(() => sandbox.restore());

    it('call Logger.leaveBlogErrorLog with MUTE option', () => loggingUtilTest.leaveMuteLogTest());
    it('call Logger.leaveBlogErrorLog with TRACE option', () => loggingUtilTest.leaveTraceLogTest());
    it('call Logger.leaveBlogErrorLog with DEBUG option', () => loggingUtilTest.leaveDebugLogTest());
    it('call Logger.leaveBlogErrorLog with INFO option', () => loggingUtilTest.leaveInfoLogTest());
    it('call Logger.leaveBlogErrorLog with WARN option', () => loggingUtilTest.leaveWarnLogTest());
    it('call Logger.leaveBlogErrorLog with ERROR option', () => loggingUtilTest.leaveErrorLogTest());
    it('call Logger.leaveBlogErrorLog with FATAL option', () => loggingUtilTest.leaveFatalLogTest());
    it('call Logger.leaveBlogErrorLog with DEFAULT option', () => loggingUtilTest.leaveDefaultLogTest());
    it('call Logger.leaveBlogErrorLog with parameters', () => loggingUtilTest.leaveLogForErrorWithParametersTest());
  });

  describe('logging ', () => {
    it.skip('call leaveLog in LOCAL environment', () => leaveLog('hello', LogLevel.INFO));
  });
});
