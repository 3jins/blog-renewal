import { ClientSession, Connection } from 'mongoose';
import { getConnection } from '@src/common/mongodb/DbConnectionUtil';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import { leaveLog } from '@src/common/logging/LoggingUtil';
import LogLevel from '@src/common/logging/LogLevel';

export const useTransaction = async (callback: Function): Promise<void> => {
  const conn: Connection = getConnection();
  const session: ClientSession = await conn.startSession();
  session.startTransaction();
  try {
    await callback(session);
    await session.commitTransaction();
    session.endSession();
    leaveLog('Transaction committed well!', LogLevel.INFO);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err instanceof (BlogError)) { // known error
      throw err;
    }
    throw new BlogError(BlogErrorCode.TRANSACTION_FAILED, [err.message]);
  }
};