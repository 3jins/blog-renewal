import pino from 'pino';
import config from 'config';

const loggingPath = config.get('path.logging');
const transportTarget: string = config.get('logger.pino.transport.target');
const transportOptions: Object = config.get('logger.pino.transport.options');

/* istanbul ignore next */
export default loggingPath === 'stdout'
  ? pino({
    transport: {
      target: transportTarget,
      options: transportOptions,
    },
  })
  : pino({
    transport: {
      target: transportTarget,
      options: { ...transportOptions, destination: `${config.get('path.appData')}${loggingPath}` },
    },
  });
