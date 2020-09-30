import { should } from 'chai';
import getConnection from '../src/util/getDbConnection';
import { ClientSession, Connection } from 'mongoose';
import memberTest from './member/memberTest';
import categoryTest from './category/categoryTest';
import tagTest from './tag/tagTest';
import postTest from './post/postTest';
import commentTest from './comment/commentTest';

/**
 * Test 'test-required' models only.
 *   ex) complicated constraints, reference, ...
 */
describe('model test', () => {
  let conn: Connection;
  let session: ClientSession;

  before(() => {
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
    it('create test', () => memberTest(session).createTest());
  });

  describe('category test', () => {
    it('create test', () => categoryTest(session).createTest());
    it('create with duplicated category no test', () => categoryTest(session).createWithDuplicatedCategoryNoTest());
    it('delete test', () => categoryTest(session).deleteTest());
  });

  describe('tag test', () => {
    it('create test', () => tagTest(session).updateTest());
  });

  describe('post test', () => {
    it('create test', () => postTest(session).createTest());
  });

  describe('comment test', () => {
    it('create test', () => commentTest(session).createTest());
  });
});
