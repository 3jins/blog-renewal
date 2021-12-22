import { should } from 'chai';
import sinon, { SinonSpiedInstance, SinonSpy, SinonStub } from 'sinon';
import config from 'config';
import detect from 'detect-port';
import * as DbConnection from '@src/common/mongodb/DbConnectionUtil';
import { connectToDb, startApp } from '@src/app';
import * as LoggingUtil from '@src/common/logging/LoggingUtil';
import { ConnectionForTest } from '@test/common/mongodb/MongodbMock';
import { common as commonTestData } from '@test/data/testData';
import LogLevel from '@src/common/logging/LogLevel';
import HomeRouter from '@src/home/HomeRouter';
import { Server } from 'http';
import { AddressInfo } from 'net';

describe('app test', () => {
  let sandbox;

  before(() => {
    should();
    sandbox = sinon.createSandbox();
  });

  after(() => {
    sandbox.restore();
  });

  it('connectToDb test', () => {
    const connectionSpiedInstance: SinonSpiedInstance<ConnectionForTest> = sandbox.spy(ConnectionForTest.prototype);
    [connectionSpiedInstance.name, connectionSpiedInstance.host] = commonTestData.simpleTexts;
    [connectionSpiedInstance.port] = commonTestData.simpleNumbers;
    const setConnectionStub: SinonStub = sandbox.stub(DbConnection, 'setConnection');
    sandbox.stub(DbConnection, 'getConnection').returns(connectionSpiedInstance);
    const leaveLogSpy: SinonSpy = sandbox.spy(LoggingUtil, 'leaveLog');

    connectToDb();
    setConnectionStub.calledOnce.should.be.true;

    connectionSpiedInstance.on.calledOnce.should.be.true;
    connectionSpiedInstance.on.firstCall.args[0].should.equal('error');
    const onCallback: Function = connectionSpiedInstance.on.firstCall.args[1];
    onCallback(commonTestData.simpleTexts[2]);
    leaveLogSpy.calledOnce.should.be.true;
    const leaveLogCallCount = leaveLogSpy.callCount;
    leaveLogSpy.firstCall.args[0].should.equal(commonTestData.simpleTexts[2]);
    leaveLogSpy.firstCall.args[1].should.equal(LogLevel.ERROR);

    connectionSpiedInstance.once.calledOnce.should.be.true;
    connectionSpiedInstance.once.firstCall.args[0].should.equal('open');
    const onceCallback: Function = connectionSpiedInstance.once.firstCall.args[1];
    onceCallback();
    leaveLogSpy.callCount.should.equal(leaveLogCallCount + 4);
    leaveLogSpy.getCall(leaveLogCallCount).args[0].should.equal('Connected to MongoDB server.');
    leaveLogSpy.getCall(leaveLogCallCount).args[1].should.equal(LogLevel.INFO);
    leaveLogSpy.getCall(leaveLogCallCount + 1).args[0].should.equal(` - name: ${commonTestData.simpleTexts[0]}`);
    leaveLogSpy.getCall(leaveLogCallCount + 1).args[1].should.equal(LogLevel.INFO);
    leaveLogSpy.getCall(leaveLogCallCount + 2).args[0].should.equal(` - host: ${commonTestData.simpleTexts[1]}`);
    leaveLogSpy.getCall(leaveLogCallCount + 2).args[1].should.equal(LogLevel.INFO);
    leaveLogSpy.getCall(leaveLogCallCount + 3).args[0].should.equal(` - port: ${commonTestData.simpleNumbers[0]}`);
    leaveLogSpy.getCall(leaveLogCallCount + 3).args[1].should.equal(LogLevel.INFO);
  });

  it('startApp test - port is not given', async () => {
    const { port } = config.get('server');
    while (true) { // eslint-disable-line no-constant-condition
      const _port = await detect(port); // eslint-disable-line no-await-in-loop
      if (_port === port) {
        const server: Server = startApp([HomeRouter]);
        (server.address() as AddressInfo).port.should.equal(port);
        server.close();
        break;
      }
      await new Promise((resolve) => setTimeout(() => resolve(null), 100)); // eslint-disable-line no-await-in-loop
    }
  }).timeout(30000);
});
