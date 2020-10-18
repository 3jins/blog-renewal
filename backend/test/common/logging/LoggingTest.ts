import { should } from 'chai';
import LoggerTest from './LoggerTest';
import Logger from '../../../src/common/logging/Logger';
import sinon from 'sinon';

describe('logging test', () => {
  before(() => should());

  describe('Logger test', () => {
    let logger: Logger;
    let sandbox;
    before(() => {
      logger = new Logger();
      sandbox = sinon.createSandbox();
    });
    beforeEach(() => sandbox.restore())
    it('call Logger.leaveLog with MUTE option', () => LoggerTest.leaveMuteLogTest(logger, sandbox));
    it('call Logger.leaveLog with DEBUG option', () => LoggerTest.leaveDebugLogTest(logger, sandbox));
    it('call Logger.leaveLog with INFO option', () => LoggerTest.leaveInfoLogTest(logger, sandbox));
    it('call Logger.leaveLog with WARN option', () => LoggerTest.leaveWarnLogTest(logger, sandbox));
    it('call Logger.leaveLog with ERROR option', () => LoggerTest.leaveErrorLogTest(logger, sandbox));
    it('call Logger.leaveLog with DEFAULT option', () => LoggerTest.leaveDefaultLogTest(logger, sandbox));
  });

});
