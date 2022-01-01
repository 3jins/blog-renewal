import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import { createMongoMemoryReplSet, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import sinon from 'sinon';
import { abortTestTransaction } from '@test/TestUtil';
import { common as commonTestData } from '@test/data/testData';
import Member, { MemberDoc } from '@src/member/Member';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('MemberRepository test', () => {
  let sandbox;
  // let memberRepository: MemberRepository;
  let replSet: MongoMemoryReplSet;
  let conn: Connection;
  let session: ClientSession;

  before(async () => {
    should();
    // memberRepository = new MemberRepository();
    replSet = await createMongoMemoryReplSet();
    conn = setConnection(replSet.getUri());
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    session = await conn.startSession();
    session.startTransaction();
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
    await replSet.stop();
  });

  it('member schema test', () => { // TODO: Remove this after repository is created.
    const member: MemberDoc = {
      ...commonTestData.masterMember,
    } as MemberDoc;
    new Member(member); // eslint-disable-line no-new
  });
});
