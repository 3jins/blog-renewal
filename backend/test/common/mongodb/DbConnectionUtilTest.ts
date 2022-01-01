import { should } from 'chai';
import { Connection } from 'mongoose';
import { createMongoMemoryReplSet, getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('DbConnectionUtilTest', () => {
  let conn: Connection;
  let replSet: MongoMemoryReplSet;

  before(async () => {
    should();
    replSet = await createMongoMemoryReplSet();
    conn = setConnection(replSet.getUri());
  });

  beforeEach(async () => {
    await conn.startSession();
  });

  after(async () => {
    await replSet.stop();
    await conn.close();
  });

  it('getConnection test', () => {
    getConnection().should.equal(conn);
  });
});
