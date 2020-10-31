import { should } from 'chai';
import Logger from '@src/common/logging/Logger';
import sinon from 'sinon';
import LoggerTest from './LoggerTest';

describe('logging test', () => {
  before(() => should());

  describe('Logger test', () => {
    let logger: Logger;
    let sandbox;
    let loggerTest;
    before(() => {
      logger = new Logger();
      sandbox = sinon.createSandbox();
      loggerTest = LoggerTest(logger, sandbox);
    });
    beforeEach(() => sandbox.restore());
    it('call Logger.leaveLog with MUTE option', () => loggerTest.leaveMuteLogTest());
    it('call Logger.leaveLog with DEBUG option', () => loggerTest.leaveDebugLogTest());
    it('call Logger.leaveLog with INFO option', () => loggerTest.leaveInfoLogTest());
    it('call Logger.leaveLog with WARN option', () => loggerTest.leaveWarnLogTest());
    it('call Logger.leaveLog with ERROR option', () => loggerTest.leaveErrorLogTest());
    it('call Logger.leaveLog with DEFAULT option', () => loggerTest.leaveDefaultLogTest());
  });
});
