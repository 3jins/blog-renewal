import { should } from 'chai';
import Image, { ImageDoc } from '@src/image/Image';
import { common as commonTestData } from '@test/data/testData';
import { ClientSession, Connection, DocumentDefinition } from 'mongoose';
import ImageRepository from '@src/image/ImageRepository';
import { createMongoMemoryReplSet, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { abortTestTransaction } from '@test/TestUtil';
import sinon from 'sinon';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('ImageRepository test', () => {
  let sandbox;
  let imageRepository: ImageRepository;
  let replSet: MongoMemoryReplSet;
  let conn: Connection;
  let session: ClientSession;

  before(async () => {
    should();
    imageRepository = new ImageRepository();
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

  it('createImages', async () => {
    const imageDocumentDefinitionList: DocumentDefinition<ImageDoc>[] = [commonTestData.gifImage, commonTestData.pngImage];
    await imageRepository.createImages(imageDocumentDefinitionList, session);
    const results = await Image.find().session(session).exec();
    results.should.have.lengthOf(2);
  });

  it('createImages - duplicated image file name', async () => {
    const imageDocumentDefinitionList: DocumentDefinition<ImageDoc>[] = [commonTestData.gifImage, commonTestData.gifImage];
    try {
      await imageRepository.createImages(imageDocumentDefinitionList, session);
    } catch (err) {
      (err instanceof BlogError).should.be.true;
      (err as BlogError).blogErrorCode.should.equal(BlogErrorCode.DUPLICATED_FILE_NAME);
    }
  });

  it('createImages - already saved image file name', async () => {
    await Image.insertMany([commonTestData.pngImage], { session });
    const imageDocumentDefinitionList: DocumentDefinition<ImageDoc>[] = [commonTestData.gifImage, commonTestData.pngImage];
    try {
      await imageRepository.createImages(imageDocumentDefinitionList, session);
    } catch (err) {
      (err instanceof BlogError).should.be.true;
      (err as BlogError).blogErrorCode.should.equal(BlogErrorCode.DUPLICATED_FILE_NAME);
    }
  });
});
