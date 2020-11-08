/* eslint-disable no-console */
import _ from 'lodash';
import { Service } from 'typedi';
import BlogError from '@src/common/error/BlogError';
import LogLevel from './LogLevel';

@Service()
export default class Logger {
  public leaveBlogErrorLog = (blogError: BlogError): void => {
    const fullMessage = this.buildMessage(blogError);
    const { blogErrorCode: { logLevel } } = blogError;
    this.leaveLog(fullMessage, logLevel);
  };

  private buildMessage = (blogError: BlogError): string => {
    const {
      blogErrorCode, params, stack, message: rawErrorMessage,
    } = blogError;
    const { code, loggingMessage } = blogErrorCode;

    let replacedLoggingMessage = loggingMessage;
    params.forEach((param, idx) => {
      replacedLoggingMessage = replacedLoggingMessage.replace(`{${idx}}`, param);
    });
    const fullMessage = `- error code: ${code}\n- message: ${replacedLoggingMessage}`;
    if (!_.isEmpty(rawErrorMessage)) {
      fullMessage.concat(`\n- raw error message: ${rawErrorMessage}`);
    }
    if (!_.isEmpty(stack)) {
      fullMessage.concat(`\n- stack: ${stack}`);
    }

    return fullMessage;
  };

  private leaveLog = (message: string, logLevel: LogLevel): void => {
    switch (logLevel) {
      case LogLevel.MUTE:
        break;
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
        console.error(message);
        break;
      default:
        console.warn(`다음 메시지에 대한 log level이 지정되지 않았습니다:\n${message}`);
    }
  };
}
