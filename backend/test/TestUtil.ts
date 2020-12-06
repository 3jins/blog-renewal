import { ClientSession } from 'mongoose';
import * as TransactionUtil from '@src/common/mongodb/TransactionUtil';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

export const replaceUseTransactionForTest = async (sandbox, session: ClientSession): Promise<void> => sandbox.replace(
  TransactionUtil,
  'useTransaction',
  async (callback: Function) => {
    try {
      await callback(session);
    } catch (err) {
      throw new BlogError(BlogErrorCode.TRANSACTION_FAILED, [err.message]);
    }
  },
);

export const abortTestTransaction = async (sandbox, session: ClientSession): Promise<void> => {
  await session.abortTransaction();
  session.endSession();
  sandbox.restore();
};
