import { should } from 'chai';
import Image, { ImageDoc } from '@src/image/Image';
import { common as commonTestData } from '@test/data/testData';
import { ClientSession, Connection, DocumentDefinition } from 'mongoose';
import ImageRepository from '@src/image/ImageRepository';
import { createMongoMemoryReplSet, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { abortTestTransaction, errorShouldBeThrown } from '@test/TestUtil';
import sinon from 'sinon';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { CreateImageRepoParamDto } from '@src/image/dto/ImageRepoParamDto';

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
    const repoParamDto: CreateImageRepoParamDto = { imageList: [commonTestData.gifImage, commonTestData.pngImage] };
    await imageRepository.createImages(repoParamDto, session);
    const results = await Image.find().session(session).lean();
    results.should.have.lengthOf(2);
  });

  it('createImages - duplicated image file name', async () => {
    const repoParamDto: CreateImageRepoParamDto = { imageList: [commonTestData.gifImage, commonTestData.gifImage] };
    await errorShouldBeThrown(
      new BlogError(BlogErrorCode.DUPLICATED_FILE_NAME, [commonTestData.gifImage.title]),
      (_repoParamDto, _session) => imageRepository.createImages(_repoParamDto, _session),
      repoParamDto,
      session,
    );
  });

  it('createImages - already saved image file name', async () => {
    await Image.insertMany([commonTestData.pngImage], { session });
    const repoParamDto: CreateImageRepoParamDto = { imageList: [commonTestData.gifImage, commonTestData.pngImage] };
    await errorShouldBeThrown(
      new BlogError(BlogErrorCode.DUPLICATED_FILE_NAME, [commonTestData.pngImage.title]),
      (_repoParamDto, _session) => imageRepository.createImages(_repoParamDto, _session),
      repoParamDto,
      session,
    );
  });
});
