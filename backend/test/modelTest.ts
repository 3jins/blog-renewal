import { should } from 'chai';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { ClientSession, Connection } from 'mongoose';
import MemberTest from './member/MemberTest';
import CategoryTest from './category/CategoryTest';
import TagTest from './tag/TagTest';
import PostTest from './post/PostTest';
import CommentTest from './comment/CommentTest';

/**
 * Test 'test-required' models only.
 *   ex) complicated constraints, reference, ...
 */
describe('model test', () => {
  let conn: Connection;
  let session: ClientSession;

  before(() => {
    setConnection();
    conn = getConnection();
    should();
  });
  beforeEach(async () => {
    session = await conn.startSession();
    session.startTransaction();
  });
  afterEach(async () => {
    await session.abortTransaction();
    await session.endSession();
  });
  after(async () => {
    await conn.close();
  });

  describe('Member test', () => {
    it('create test', () => MemberTest(session).createTest());
  });

  describe('category test', () => {
    it('create test', () => CategoryTest(session).createTest());
    it('create with duplicated category no test', () => CategoryTest(session).createWithDuplicatedCategoryNoTest());
    it('delete test', () => CategoryTest(session).deleteTest());
  });

  describe('tag test', () => {
    it('create test', () => TagTest(session).updateTest());
  });

  describe('post test', () => {
    it('create test', () => PostTest(session).createTest());
  });

  describe('comment test', () => {
    it('create test', () => CommentTest(session).createTest());
  });
});
