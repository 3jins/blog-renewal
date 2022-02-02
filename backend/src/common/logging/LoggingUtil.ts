import _ from 'lodash';
import BlogError from '@src/common/error/BlogError';
import Logger from '@src/common/logging/Logger';
import LogLevel from './LogLevel';

export const buildMessage = (blogError: BlogError): string => {
  const {
    blogErrorCode, params, stack, message: rawErrorMessage,
  } = blogError;
  const { code, loggingMessage } = blogErrorCode;

  let replacedLoggingMessage = loggingMessage;
  params.forEach((param, idx) => {
    replacedLoggingMessage = replacedLoggingMessage.replace(`{${idx}}`, param);
  });
  let fullMessage = `- error code: ${code}\n- message: ${replacedLoggingMessage}`;
  if (!_.isEmpty(rawErrorMessage)) {
    fullMessage = fullMessage.concat(`\n- raw error message: ${rawErrorMessage}`);
  }
  fullMessage = fullMessage.concat(`\n- stack: ${stack}`);

  return fullMessage;
};

export const leaveLog = (message: any, logLevel: LogLevel): void => {
  const stringifiedMessage: string = typeof message === 'string'
    ? message
    : JSON.stringify(message);
  switch (logLevel) {
    case LogLevel.MUTE:
      break;
    case LogLevel.TRACE:
      Logger.trace(stringifiedMessage);
      break;
    case LogLevel.DEBUG:
      Logger.debug(stringifiedMessage);
      break;
    case LogLevel.INFO:
      Logger.info(stringifiedMessage);
      break;
    case LogLevel.WARN:
      Logger.warn(stringifiedMessage);
      break;
    case LogLevel.ERROR:
      Logger.error(stringifiedMessage);
      break;
    case LogLevel.FATAL:
      Logger.fatal(stringifiedMessage);
      break;
    default:
      Logger.warn(`다음 메시지에 대한 log level이 지정되지 않았습니다:\n${stringifiedMessage}`);
  }
};

export const leaveBlogErrorLog = (blogError: BlogError): void => {
  const fullMessage = buildMessage(blogError);
  const { blogErrorCode: { logLevel } } = blogError;
  leaveLog(fullMessage, logLevel);
};
