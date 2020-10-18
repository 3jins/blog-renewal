import Logger from '../../../src/common/logging/Logger';
import LogLevel from '../../../src/common/logging/LogLevel';
import { common as commonTestData } from '../../data/testData';
import _ from 'lodash';
import { spy } from 'ts-mockito';

export default ({
  leaveMuteLogTest: (logger: Logger, sandbox) => {
    const consoleStub = sandbox.stub(console);
    logger.leaveLog(LogLevel.MUTE, commonTestData.simpleText);
    const spyFunctions = _.keys(consoleStub);
    spyFunctions.forEach(spyFunction => {
      consoleStub[spyFunction].notCalled.should.be.true;
    });
  },
  leaveDebugLogTest: (logger: Logger, sandbox) => {
    const consoleDebugStub = sandbox.stub(console, 'debug');
    logger.leaveLog(LogLevel.DEBUG, commonTestData.simpleText);
    consoleDebugStub.calledOnce.should.be.true;
  },
  leaveInfoLogTest: (logger: Logger, sandbox) => {
    const consoleInfoStub = sandbox.stub(console, 'info');
    logger.leaveLog(LogLevel.INFO, commonTestData.simpleText);
    consoleInfoStub.calledOnce.should.be.true;
  },
  leaveWarnLogTest: (logger: Logger, sandbox) => {
    const consoleWarnStub = sandbox.stub(console, 'warn');
    logger.leaveLog(LogLevel.WARN, commonTestData.simpleText);
    consoleWarnStub.calledOnce.should.be.true;
  },
  leaveErrorLogTest: (logger: Logger, sandbox) => {
    const consoleErrorStub = sandbox.stub(console, 'error');
    logger.leaveLog(LogLevel.ERROR, commonTestData.simpleText);
    consoleErrorStub.calledOnce.should.be.true;
  },
  leaveDefaultLogTest: (logger: Logger, sandbox) => {
    const consoleStub = sandbox.stub(console);
    logger.leaveLog(1073741824, commonTestData.simpleText);
    const spyFunctions = _.keys(consoleStub);
    spyFunctions.forEach(spyFunction => {
      if (spyFunction === 'warn') {
        consoleStub[spyFunction].calledOnce.should.be.true;
        consoleStub[spyFunction].args.should.have.lengthOf(1);
        consoleStub[spyFunction].args[0].should.have.lengthOf(1);
        consoleStub[spyFunction].args[0][0].should.equal(`다음 메시지에 대한 log level이 지정되지 않았습니다: - message: ${commonTestData.simpleText}`);
      } else {
        consoleStub[spyFunction].notCalled.should.be.true;
      }
    });
  },
});
