/* eslint-disable no-empty-function */
import { ClientSession } from 'mongodb';
import { Connection, Document } from 'mongoose';

// @ts-ignore
export class ClientSessionForTest implements ClientSession {
  /*
   * Since the original one(ClientSession) is an interface, not a specific class, mock implementation is needed to be stubbed.
   * If the implementation mock(ClientSessionForTest) should be modified for the change of the test scenario, refer `mongoose.ClientSession`.
   */

  abortTransaction = (): Promise<Document> => Promise.resolve(new Document());

  commitTransaction = (): Promise<Document> => Promise.resolve(new Document());

  // eslint-disable-next-line no-unused-vars
  endSession = async (options?: Object): Promise<void> => {};

  startTransaction = (): void => {};
}

export class ConnectionForTest extends Connection {
  clientSessionStub: ClientSessionForTest;

  constructor(clientSessionStub: ClientSessionForTest) {
    // @ts-ignore
    super(undefined);
    this.clientSessionStub = clientSessionStub;
  }

  // @ts-ignore
  startSession = (): Promise<ClientSession> => new Promise((resolve) => resolve(this.clientSessionStub));
}
