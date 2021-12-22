import sinon, { SinonSandbox, SinonSpiedInstance, SinonSpy } from 'sinon';
import { should } from 'chai';
import * as DbConnectionUtil from '@src/common/mongodb/DbConnectionUtil';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { ClientSessionForTest, ConnectionForTest } from '@test/common/mongodb/MongodbMock';
import { errorShouldBeThrown } from '@test/TestUtil';
import { blogErrorCode } from '@test/data/testData';
import config from 'config';

describe('TransactionUtil Test', () => {
  // eslint-disable-next-line mocha/no-setup-in-describe
  const { retryCount } = config.get('db');
  const testTimeout = (retryCount + 2) * 1000;
  let sandbox: SinonSandbox;
  let clientSessionSpy: SinonSpiedInstance<ClientSessionForTest>;

  before(() => {
    should();
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    clientSessionSpy = sandbox.spy(new ClientSessionForTest());
    const connectionSpy: SinonSpiedInstance<ConnectionForTest> = sandbox.spy(new ConnectionForTest(clientSessionSpy));
    // @ts-ignore
    sandbox.stub(DbConnectionUtil, 'getConnection').returns(connectionSpy);
    sandbox.stub(DbConnectionUtil, 'setConnection');
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it('Transaction commit ok', async () => {
    const successText = '^_______^';
    const result = await useTransaction(async () => successText);

    clientSessionSpy.startTransaction.calledOnce.should.be.true;
    clientSessionSpy.commitTransaction.calledOnce.should.be.true;
    clientSessionSpy.endSession.calledOnce.should.be.true;
    result.should.equal(successText);
  });

  it('Transaction rollback by a predicted error', async () => {
    const expectedError = new BlogError(blogErrorCode.TEST_ERROR);
    await errorShouldBeThrown(
      expectedError,
      () => useTransaction(async () => {
        throw expectedError;
      }),
    );
    clientSessionSpy.startTransaction.calledOnce.should.be.true;
    clientSessionSpy.abortTransaction.calledOnce.should.be.true;
    clientSessionSpy.endSession.calledOnce.should.be.true;
  }).timeout(testTimeout);

  it('Transaction rollback by an unexpected error', async () => {
    await errorShouldBeThrown(
      new BlogError(BlogErrorCode.TRANSACTION_FAILED, [blogErrorCode.TEST_ERROR.errorMessage]),
      () => useTransaction(async () => {
        throw new Error(blogErrorCode.TEST_ERROR.errorMessage);
      }),
    );
    clientSessionSpy.startTransaction.calledOnce.should.be.true;
    clientSessionSpy.abortTransaction.calledOnce.should.be.true;
    clientSessionSpy.endSession.calledOnce.should.be.true;
  }).timeout(testTimeout);

  it('Transaction failure test - retry maximum count', async () => {
    const expectedError = new BlogError(blogErrorCode.TEST_ERROR);
    const spyJob: SinonSpy = sandbox.spy(async () => {
      throw expectedError;
    });
    await errorShouldBeThrown(
      expectedError,
      () => useTransaction(spyJob),
    );
    spyJob.callCount.should.equal(retryCount + 1);
  }).timeout(testTimeout * 200);
});
