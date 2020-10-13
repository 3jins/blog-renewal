import _ from 'lodash';
import LogLevel from './LogLevel';
import { Service } from 'typedi';

@Service()
export default class Logger {
  public leaveLog(logLevel: LogLevel, message: string, stack?: string): void {
    let loggingMessage = `- message: ${message}`;
    if (!_.isEmpty(stack)) {
      loggingMessage += `\n- stack: ${stack}`;
    }

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
  }
}
