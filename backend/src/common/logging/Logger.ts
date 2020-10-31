/* eslint-disable no-console */
import _ from 'lodash';
import { Service } from 'typedi';
import LogLevel from './LogLevel';

@Service()
export default class Logger {
  public leaveLog = (logLevel: LogLevel, message: string, stack?: string): void => {
    const loggingMessage = `- message: ${message}${_.isEmpty(stack) ? '' : `\n- stack: ${stack}`}`;

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
        console.warn(`다음 메시지에 대한 log level이 지정되지 않았습니다: ${loggingMessage}`);
    }
  };
}
