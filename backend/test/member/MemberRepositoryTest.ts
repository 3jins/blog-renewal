import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import sinon from 'sinon';
import { abortTestTransaction } from '@test/TestUtil';
import { common as commonTestData } from '@test/data/testData';
import Member, { MemberDoc } from '@src/member/Member';

describe('MemberRepository test', () => {
  let sandbox;
  // let memberRepository: MemberRepository;
  let conn: Connection;
  let session: ClientSession;

  before(() => {
    should();
    // memberRepository = new MemberRepository();
    setConnection();
    conn = getConnection();
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
  });

  it('member schema test', () => { // TODO: Remove this after repository is created.
    const member: MemberDoc = {
      ...commonTestData.masterMember,
    } as MemberDoc;
    new Member(member); // eslint-disable-line no-new
  });
});
