import { should } from 'chai';
import Image, { ImageDoc } from '@src/image/Image';
import { common as commonTestData } from '@test/data/testData';
import { ClientSession, Connection, CreateQuery } from 'mongoose';
import ImageRepository from '@src/image/ImageRepository';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { abortTestTransaction, replaceUseTransactionForTest } from '@test/TestUtil';
import sinon from 'sinon';

describe('ImageRepository test', () => {
  let sandbox;
  let imageRepository: ImageRepository;
  let conn: Connection;
  let session: ClientSession;

  before(() => {
    should();
    imageRepository = new ImageRepository();
    setConnection();
    conn = getConnection();
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    session = await conn.startSession();
    session.startTransaction();
    await replaceUseTransactionForTest(sandbox, session);
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
  });

  it('createImages', async () => {
    const imageCreateQueryList: CreateQuery<ImageDoc>[] = [commonTestData.gifImage, commonTestData.pngImage];
    await imageRepository.createImages(imageCreateQueryList);
    const results = await Image.find().session(session).exec();
    results.should.have.lengthOf(2);
  });
});
