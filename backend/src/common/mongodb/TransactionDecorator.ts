import { ClientSession, Connection } from 'mongoose';
import { getConnection } from '@src/common/mongodb/DbConnectionUtil';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import { leaveLog } from '@src/common/logging/LoggingUtil';
import LogLevel from '@src/common/logging/LogLevel';

export const useTransaction = async (callback: Function): Promise<any> => {
  const conn: Connection = getConnection();
  const session: ClientSession = await conn.startSession();
  session.startTransaction();
  try {
    const result = await callback(session);
    await session.commitTransaction();
    session.endSession();
    leaveLog('Transaction committed well!', LogLevel.INFO);
    return result;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err instanceof BlogError) { // known error
      throw err;
    }
    throw new BlogError(BlogErrorCode.TRANSACTION_FAILED, [err.message]);
  }
};

export const transactional = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const method: Function = descriptor.value;

  Object.assign(descriptor, {
    async value(...args) {
      const conn: Connection = getConnection();
      const session: ClientSession = await conn.startSession();
      session.startTransaction();
      try {
        // TODO: 콜백을 리턴하게끔 뭐 어떻게 해서(이것도 사실 좀 억지스러운 느낌은 있는데...) 일단 여기에 session 넣는 것까지는 됐음.
        //  파라미터만 전달하면 되는데 29라인에서 어떻게 빼올 수 있지 않을까 싶기는 함. 구글링 ㄱㄱ.
        const result = await method.apply(this, args)(session);
        await session.commitTransaction();
        session.endSession();
        leaveLog('Transaction committed well!', LogLevel.INFO);
        return result;
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        if (err instanceof BlogError) { // known error
          throw err;
        }
        throw new BlogError(BlogErrorCode.TRANSACTION_FAILED, [err.message]);
      }
    },
  });
};
