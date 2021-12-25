import pino from 'pino';
import config from 'config';

const loggingPath = config.get('path.logging');
const loggerOption: Object = config.get('logger.pino.option');

/* istanbul ignore next */
export default loggingPath === 'stdout' ? pino(loggerOption) : pino(loggerOption, pino.destination(`${config.get('path.appData')}${loggingPath}`));
