import sinon from 'sinon';
import { should } from 'chai';
import { ClientSession } from 'mongodb';
import * as DbConnectionUtil from '@src/common/mongodb/DbConnectionUtil';
import { transactional } from '@src/common/mongodb/TransactionDecorator';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { ClientSessionForTest, ConnectionForTest } from '@test/common/mongodb/MongodbMock';
import { errorShouldBeThrown } from '@test/TestUtil';
import { blogErrorCode } from '@test/data/testData';

class TransactionalTestingClass {
  public expectedError: BlogError = new BlogError(blogErrorCode.TEST_ERROR);

  @transactional()
  public success(param): Function {
    return async (session: ClientSession): Promise<Object> => ({ param, session });
  }

  @transactional()
  public failWithBlogError(): Function {
    throw this.expectedError;
  }

  @transactional()
  public failWithNormalError(): Function {
    throw new Error(blogErrorCode.TEST_ERROR.errorMessage);
  }
}

describe('TransactionUtil Test', () => {
  let sandbox;
  let clientSessionSpy;
  const transactionalTestingInstance = new TransactionalTestingClass();

  before(() => {
    should();
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    clientSessionSpy = sandbox.spy(new ClientSessionForTest());
    const connectionSpy = sandbox.spy(new ConnectionForTest(clientSessionSpy));
    sandbox.stub(DbConnectionUtil, 'getConnection').returns(connectionSpy);
    sandbox.stub(DbConnectionUtil, 'setConnection');
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it('Transaction commit ok', async () => {
    const successText: string = '^_______^';
    const result = await transactionalTestingInstance.success(successText);

    clientSessionSpy.startTransaction.calledOnce.should.be.true;
    clientSessionSpy.commitTransaction.calledOnce.should.be.true;
    clientSessionSpy.endSession.calledOnce.should.be.true;
    result.should.deep.equal({ param: successText, session: clientSessionSpy });
  });

  it('Transaction rollback by a predicted error', async () => {
    await errorShouldBeThrown(
      transactionalTestingInstance.expectedError,
      () => transactionalTestingInstance.failWithBlogError(),
    );

    clientSessionSpy.startTransaction.calledOnce.should.be.true;
    clientSessionSpy.abortTransaction.calledOnce.should.be.true;
    clientSessionSpy.endSession.calledOnce.should.be.true;
  });

  it('Transaction rollback by an unexpected error', async () => {
    await errorShouldBeThrown(
      new BlogError(BlogErrorCode.TRANSACTION_FAILED, [blogErrorCode.TEST_ERROR.errorMessage]),
      () => transactionalTestingInstance.failWithNormalError(),
    );

    clientSessionSpy.startTransaction.calledOnce.should.be.true;
    clientSessionSpy.abortTransaction.calledOnce.should.be.true;
    clientSessionSpy.endSession.calledOnce.should.be.true;
  });
});
