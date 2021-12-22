/* eslint-disable no-empty-function */
import { ClientSession, Connection } from 'mongoose';

// @ts-ignore
export class ClientSessionForTest implements ClientSession {
  /*
   * Since the original one(ClientSession) is an interface, not a specific class, mock implementation is needed to be stubbed.
   * If the implementation mock(ClientSessionForTest) should be modified for the change of the test scenario, refer `mongoose.ClientSession`.
   */

  public abortTransaction(): Promise<any> {
    return Promise.resolve({});
  }

  public commitTransaction(): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  public async endSession(options?: Object): Promise<void> {
  }

  public startTransaction(): void {
  }
}

export class ConnectionForTest extends Connection {
  clientSessionStub: ClientSessionForTest;

  constructor(clientSessionStub: ClientSessionForTest) {
    // @ts-ignore
    super(undefined);
    this.clientSessionStub = clientSessionStub;
  }

  public startSession(): Promise<ClientSession> {
    return new Promise((resolve) => resolve(this.clientSessionStub as ClientSession));
  }

  // eslint-disable-next-line no-unused-vars
  public on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return this;
  }

  // eslint-disable-next-line no-unused-vars
  public once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return this;
  }
}
