import _ from 'lodash';
import BlogError from '@src/common/error/BlogError';
import Logger from '@src/common/logging/Logger';
import LogLevel from './LogLevel';

const buildMessage = (blogError: BlogError): string => {
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
  switch (logLevel) {
    case LogLevel.MUTE:
      break;
    case LogLevel.TRACE:
      Logger.trace(message);
      break;
    case LogLevel.DEBUG:
      Logger.debug(message);
      break;
    case LogLevel.INFO:
      Logger.info(message);
      break;
    case LogLevel.WARN:
      Logger.warn(message);
      break;
    case LogLevel.ERROR:
      Logger.error(message);
      break;
    case LogLevel.FATAL:
      Logger.fatal(message);
      break;
    default:
      Logger.warn(`다음 메시지에 대한 log level이 지정되지 않았습니다:\n${message}`);
  }
};

export const leaveBlogErrorLog = (blogError: BlogError): void => {
  const fullMessage = buildMessage(blogError);
  const { blogErrorCode: { logLevel } } = blogError;
  leaveLog(fullMessage, logLevel);
};
