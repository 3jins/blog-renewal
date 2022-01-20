import _ from 'lodash';
import { ExtendableContext, Next } from 'koa';
import { leaveLog } from '@src/common/logging/LoggingUtil';
import LogLevel from '@src/common/logging/LogLevel';

export const leaveRequestLog = () => async (ctx: ExtendableContext, next: Next) => {
  const { ip, body, files } = ctx.request;
  const responseTime = ctx.response.get('X-Response-Time');
  leaveLog(`${ctx.method} ${ctx.url} - ${responseTime} from ${ip}`, LogLevel.INFO);
  if (!_.isEmpty(body)) {
    leaveLog(`request body: ${JSON.stringify(body)}`, LogLevel.INFO);
  }
  if (!_.isEmpty(files)) {
    leaveLog(`request files: ${JSON.stringify(files)}`, LogLevel.INFO);
  }
  await next();
};
