import _ from 'lodash';
import { leaveBlogErrorLog } from '@src/common/logging/LoggingUtil';
import BlogError from '@src/common/error/BlogError';
import { common as commonTestData } from '../../data/testData';

export default (loggerStub, dummyBlogErrorCode) => ({
  leaveMuteLogTest: () => {
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_MUTE));
    _.keys(loggerStub)
      .filter((spyFunction) => loggerStub[spyFunction].notCalled !== undefined)
      .forEach((spyFunction) => loggerStub[spyFunction].notCalled.should.be.true);
  },
  leaveTraceLogTest: () => {
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_TRACE));
    loggerStub.trace.calledOnce.should.be.true;
  },
  leaveDebugLogTest: () => {
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_DEBUG));
    loggerStub.debug.calledOnce.should.be.true;
  },
  leaveInfoLogTest: () => {
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_INFO));
    loggerStub.info.calledOnce.should.be.true;
  },
  leaveWarnLogTest: () => {
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_WARN));
    loggerStub.warn.calledOnce.should.be.true;
  },
  leaveErrorLogTest: () => {
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_ERROR));
    loggerStub.error.calledOnce.should.be.true;
  },
  leaveFatalLogTest: () => {
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_FATAL));
    loggerStub.fatal.calledOnce.should.be.true;
  },
  leaveDefaultLogTest: () => {
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_DEFAULT));
    loggerStub.warn.calledOnce.should.be.true;
    loggerStub.warn.args.should.have.lengthOf(1);
    loggerStub.warn.args[0].should.have.lengthOf(1);
    loggerStub.warn.args[0][0].should.equal(
      `다음 메시지에 대한 log level이 지정되지 않았습니다:\n- error code: ${dummyBlogErrorCode.TEST_DEFAULT.code}\n- message: ${commonTestData.simpleText}`,
    );
    _.keys(loggerStub)
      .filter((spyFunction) => spyFunction !== 'warn' && loggerStub[spyFunction].notCalled !== undefined)
      .forEach((spyFunction) => loggerStub[spyFunction].notCalled.should.be.true);
  },
  leaveLogForErrorWithParametersTest: () => {
    const params = ['Tablo', 'Mithra', 'Tukutz'];
    leaveBlogErrorLog(new BlogError(dummyBlogErrorCode.TEST_ERROR_WITH_PARAMS, params));
    loggerStub.error.calledOnce.should.be.true;
    loggerStub.error.args.should.have.lengthOf(1);
    loggerStub.error.args[0].should.have.lengthOf(1);
    loggerStub.error.args[0][0].should.equal(
      `- error code: ${dummyBlogErrorCode.TEST_ERROR_WITH_PARAMS.code}\n- message: Parameters are given: ${params[0]}, ${params[1]}, and ${params[2]}.`, // eslint-disable-line max-len
    );
  },
});
