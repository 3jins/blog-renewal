import _ from 'lodash';
import Logger from 'src/common/logging/Logger';
import LogLevel from 'src/common/logging/LogLevel';
import { common as commonTestData } from '../../data/testData';

export default (logger: Logger, sandbox) => ({
  leaveMuteLogTest: () => {
    const consoleStub = sandbox.stub(console);
    logger.leaveLog(LogLevel.MUTE, commonTestData.simpleText);
    const spyFunctions = _.keys(consoleStub);
    spyFunctions.forEach((spyFunction) => {
      consoleStub[spyFunction].notCalled.should.be.true;
    });
  },
  leaveDebugLogTest: () => {
    const consoleDebugStub = sandbox.stub(console, 'debug');
    logger.leaveLog(LogLevel.DEBUG, commonTestData.simpleText);
    consoleDebugStub.calledOnce.should.be.true;
  },
  leaveInfoLogTest: () => {
    const consoleInfoStub = sandbox.stub(console, 'info');
    logger.leaveLog(LogLevel.INFO, commonTestData.simpleText);
    consoleInfoStub.calledOnce.should.be.true;
  },
  leaveWarnLogTest: () => {
    const consoleWarnStub = sandbox.stub(console, 'warn');
    logger.leaveLog(LogLevel.WARN, commonTestData.simpleText);
    consoleWarnStub.calledOnce.should.be.true;
  },
  leaveErrorLogTest: () => {
    const consoleErrorStub = sandbox.stub(console, 'error');
    logger.leaveLog(LogLevel.ERROR, commonTestData.simpleText);
    consoleErrorStub.calledOnce.should.be.true;
  },
  leaveDefaultLogTest: () => {
    const consoleStub = sandbox.stub(console);
    logger.leaveLog(1073741824, commonTestData.simpleText);
    const spyFunctions = _.keys(consoleStub);
    spyFunctions.forEach((spyFunction) => {
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
