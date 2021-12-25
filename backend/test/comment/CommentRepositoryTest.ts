import { ClientSession, Connection } from 'mongoose';
import { should } from 'chai';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import sinon from 'sinon';
import { abortTestTransaction } from '@test/TestUtil';
import { common as commonTestData } from '@test/data/testData';
import Comment, { CommentDoc } from '@src/comment/Comment';

describe('CommentRepository test', () => {
  let sandbox;
  // let commentRepository: CommentRepository;
  let conn: Connection;
  let session: ClientSession;

  before(() => {
    should();
    // commentRepository = new CommentRepository();
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

  it('comment schema test', () => { // TODO: Remove this after repository is created.
    const comment: CommentDoc = {
      ...commonTestData.comment1,
      post: commonTestData.objectIdList[0],
      member: commonTestData.objectIdList[1],
    } as CommentDoc;
    new Comment(comment); // eslint-disable-line no-new
  });
});
