import { ClientSession } from 'mongoose';
import * as TransactionUtil from '@src/common/mongodb/TransactionDecorator';
import BlogError from '@src/common/error/BlogError';

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

const assertThrownErrorIsExpectedBlogError = (errorThrown: BlogError, errorShouldBe: BlogError) => {
  errorThrown.blogErrorCode.should.equal(errorShouldBe.blogErrorCode);
  errorThrown.params.should.deep.equal(errorShouldBe.params);
  errorThrown.name.should.equal(errorShouldBe.name);
  errorThrown.message.should.equal(errorShouldBe.message);
};

const assertThrownErrorIsExpectedError = (errorThrown: Error, errorShouldBe: Error) => {
  errorThrown.name.should.equal(errorShouldBe.name);
  errorThrown.message.should.equal(errorShouldBe.message);
};

// Do not use this function for routers. Instead, use `expect` of supertest.
export const errorShouldBeThrown = async (errorShouldBe: Error, callback: Function, ...params: any[]) => {
  let isAnyErrorThrown: boolean = false;
  try {
    await callback(...params);
  } catch (error) {
    isAnyErrorThrown = true;
    if (errorShouldBe instanceof BlogError) {
      (error instanceof BlogError).should.be.true;
      assertThrownErrorIsExpectedBlogError(error, errorShouldBe);
    } else {
      assertThrownErrorIsExpectedError(error, errorShouldBe);
    }
  }
  isAnyErrorThrown.should.be.true;
};
