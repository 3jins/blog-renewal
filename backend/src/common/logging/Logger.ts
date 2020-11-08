/* eslint-disable no-console */
import _ from 'lodash';
import { Service } from 'typedi';
import BlogError from '@src/common/error/BlogError';
import LogLevel from './LogLevel';

@Service()
export default class Logger {
  public leaveBlogErrorLog = (blogError: BlogError): void => {
    const loggingMessage = this.buildMessage(blogError);
    const { blogErrorCode: { logLevel } } = blogError;
    this.leaveLog(loggingMessage, logLevel);
  };

  private buildMessage = (blogError: BlogError): string => {
    const {
      blogErrorCode, params, stack, message: rawErrorMessage,
    } = blogError;
    const { code, errorMessage } = blogErrorCode;

    params.forEach((param, idx) => errorMessage.replace(`{${idx}}`, param));
    const loggingMessage = `- error code: ${code}\n- message: ${errorMessage}`;
    if (!_.isEmpty(rawErrorMessage)) {
      loggingMessage.concat(`\n- raw error message: ${rawErrorMessage}`);
    }
    if (!_.isEmpty(stack)) {
      loggingMessage.concat(`\n- stack: ${stack}`);
    }

    return loggingMessage;
  };

  private leaveLog = (loggingMessage: string, logLevel: LogLevel): void => {
    switch (logLevel) {
      case LogLevel.MUTE:
        break;
      case LogLevel.DEBUG:
        console.debug(loggingMessage);
        break;
      case LogLevel.INFO:
        console.info(loggingMessage);
        break;
      case LogLevel.WARN:
        console.warn(loggingMessage);
        break;
      case LogLevel.ERROR:
        console.error(loggingMessage);
        break;
      default:
        console.warn(`다음 메시지에 대한 log level이 지정되지 않았습니다:\n${loggingMessage}`);
    }
  };
}
