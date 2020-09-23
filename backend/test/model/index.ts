import { should } from 'chai';
import getConnection from '../../src/db/getConnection';
import { ClientSession, Connection } from 'mongoose';
import memberTest from './memberTest';
import categoryTest from './categoryTest';
import tagTest from './tagTest';
import postTest from './postTest';
import commentTest from './commentTest';

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

  describe('Category test', () => {
    it('create test', () => categoryTest(session).createTest());
    it('create with duplicated category no test', () => categoryTest(session).createWithDuplicatedCategoryNoTest());
    it('delete test', () => categoryTest(session).deleteTest());
  });

  describe('Tag test', () => {
    it('create test', () => tagTest(session).updateTest());
  });

  describe('Post test', () => {
    it('create test', () => postTest(session).createTest());
  });

  describe('Comment test', () => {
    it('create test', () => commentTest(session).createTest());
  });
});
