import { ClientSession } from 'mongoose';
import * as TransactionUtil from '@src/common/mongodb/TransactionUtil';

export const replaceUseTransactionForTest = async (sandbox, session: ClientSession): Promise<any> => sandbox.replace(
  TransactionUtil,
  'useTransaction',
  (callback: Function): Promise<any> => callback(session),
);

export const abortTestTransaction = async (sandbox, session: ClientSession): Promise<void> => {
  await session.abortTransaction();
  session.endSession();
  sandbox.restore();
};
