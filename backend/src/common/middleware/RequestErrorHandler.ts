import { ExtendableContext, Next } from 'koa';
import { handleError } from '@src/common/error/BlogErrorHandlingUtil';

export const handleRequestError = () => (ctx: ExtendableContext, next: Next) => next()
  .catch((err: Error) => handleError(ctx, err));
