import { should } from 'chai';
import sinon, { SinonMock, SinonSandbox, SinonSpiedInstance, SinonSpy, SinonStub } from 'sinon';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { startApp } from '@src/app';
import HomeRouter from '@src/home/HomeRouter';
import config from 'config';
import crypto, { randomInt } from 'crypto';

describe('app test', () => {
  before(() => {
    should();
  });

  it('startApp test - retry maximum count', async () => {
    let server1: Server | null = null;
    let server2: Server | null = null;
    const { port, retryCount } = config.get('server');

    const sandbox: SinonSandbox = sinon.createSandbox();
    const randomIntStub: SinonStub = sandbox.stub(crypto, 'randomInt').returns(port);

    server1 = startApp([HomeRouter]);
    (server1.address() as AddressInfo).port.should.equal(port);

    setTimeout(() => { // Deadlock can be caused if multiple servers try starting with the same configuration
      try {
        server2 = startApp([HomeRouter]);
      } finally {
        if (server2 !== null) {
          server2.close();
        }
      }
    }, 100);

    await new Promise((resolve) => setTimeout(() => {
      randomIntStub.callCount.should.equal(retryCount);
      if (server1 !== null) {
        server1.close();
      }
      sinon.restore();
      resolve(null);
    }, 9000));
  }).timeout(10000);
});
