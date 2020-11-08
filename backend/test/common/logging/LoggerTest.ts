import _ from 'lodash';
import Logger from 'src/common/logging/Logger';
import BlogError from '@src/common/error/BlogError';
import { common as commonTestData } from '../../data/testData';

export default (logger: Logger, sandbox, dummyBlogErrorCode) => ({
  leaveMuteLogTest: () => {
    const consoleStub = sandbox.stub(console);
    logger.leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_MUTE));
    const spyFunctions = _.keys(consoleStub);
    spyFunctions.forEach((spyFunction) => {
      consoleStub[spyFunction].notCalled.should.be.true;
    });
  },
  leaveDebugLogTest: () => {
    const consoleDebugStub = sandbox.stub(console, 'debug');
    logger.leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_DEBUG));
    consoleDebugStub.calledOnce.should.be.true;
  },
  leaveInfoLogTest: () => {
    const consoleInfoStub = sandbox.stub(console, 'info');
    logger.leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_INFO));
    consoleInfoStub.calledOnce.should.be.true;
  },
  leaveWarnLogTest: () => {
    const consoleWarnStub = sandbox.stub(console, 'warn');
    logger.leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_WARN));
    consoleWarnStub.calledOnce.should.be.true;
  },
  leaveErrorLogTest: () => {
    const consoleErrorStub = sandbox.stub(console, 'error');
    logger.leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_ERROR));
    consoleErrorStub.calledOnce.should.be.true;
  },
  leaveDefaultLogTest: () => {
    const consoleStub = sandbox.stub(console);
    logger.leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_DEFAULT));
    const spyFunctions = _.keys(consoleStub);
    spyFunctions.forEach((spyFunction) => {
      if (spyFunction === 'warn') {
        consoleStub[spyFunction].calledOnce.should.be.true;
        consoleStub[spyFunction].args.should.have.lengthOf(1);
        consoleStub[spyFunction].args[0].should.have.lengthOf(1);
        consoleStub[spyFunction].args[0][0].should.equal(
          `다음 메시지에 대한 log level이 지정되지 않았습니다:\n- error code: ${dummyBlogErrorCode.TEST_DEFAULT.code}\n- message: ${commonTestData.simpleText}`,
        );
      } else {
        consoleStub[spyFunction].notCalled.should.be.true;
      }
    });
  },
});
