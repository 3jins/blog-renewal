import { ClientSession, Connection } from 'mongoose';
import config from 'config';
import { getConnection } from '@src/common/mongodb/DbConnectionUtil';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import { leaveLog, buildMessage } from '@src/common/logging/LoggingUtil';
import LogLevel from '@src/common/logging/LogLevel';

const tryTransaction = async (session: ClientSession, callback: Function, error: Error | null = null, retryIdx: number = 0): Promise<any> => {
  const { retryCount } = config.get('db');

  if (retryIdx > retryCount) {
    await session.abortTransaction();
    await session.endSession();
    if (error instanceof (BlogError)) { // known error
      leaveLog(`Transaction has failed by the error: ${buildMessage((error! as BlogError))}`, LogLevel.ERROR);
      throw error;
    }
    leaveLog(`Transaction has failed by the error: ${error!.message}`, LogLevel.ERROR);
    throw new BlogError(BlogErrorCode.TRANSACTION_FAILED, [(error as Error).message]);
  }

  try {
    if (retryIdx > 0) {
      leaveLog(`Retrying a job in transaction... (${retryIdx}/${retryCount})`, LogLevel.INFO);
    }
    const result = await callback(session);
    await session.commitTransaction();
    await session.endSession();
    leaveLog('Transaction committed well!', LogLevel.INFO);
    return result;
  } catch (rawError) {
    return new Promise((resolve, reject) => {
      setTimeout(
        async () => {
          const result = await tryTransaction(session, callback, rawError as Error, retryIdx + 1)
            .catch((handledError) => reject(handledError));
          resolve(result);
        },
        1000,
      );
    });
  }
};

export const useTransaction = async (callback: Function): Promise<any> => {
  const conn: Connection = getConnection();
  const session: ClientSession = await conn.startSession();
  session.startTransaction();
  return tryTransaction(session, callback);
};
