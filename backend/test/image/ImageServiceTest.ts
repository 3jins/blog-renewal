import _ from 'lodash';
import sinon from 'sinon';
import { should } from 'chai';
import path from 'path';
import fs, { PathLike } from 'fs';
import config from 'config';
import { File, FileJSON, Files } from 'formidable';
import { anyOfClass, anything, capture, instance, mock, verify } from 'ts-mockito';
import { ClientSession, Connection, DocumentDefinition } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import ImageService from '@src/image/ImageService';
import ImageRepository from '@src/image/ImageRepository';
import { ImageDoc } from '@src/image/Image';
import { createMongoMemoryReplSet, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import { abortTestTransaction, errorShouldBeThrown, replaceUseTransactionForTest } from '@test/TestUtil';
import { appPath, common as commonTestData } from '@test/data/testData';

describe('ImageService test', () => {
  let sandbox;
  let replSet: MongoMemoryReplSet;
  let conn: Connection;
  let session: ClientSession;
  let imageService: ImageService;
  let imageRepository: ImageRepository;

  before(async () => {
    imageRepository = mock(ImageRepository);
    imageService = new ImageService(instance(imageRepository));
    should();
    replSet = await createMongoMemoryReplSet();
    conn = setConnection(replSet.getUri());
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
    await replSet.stop();
  });

  describe('uploadImage test', () => {
    let fileNameList;
    let files: Files;

    before(() => {
      fileNameList = [commonTestData.gifImage.title, commonTestData.pngImage.title];
      const fileList: File[] = fileNameList.map((fileName) => {
        const filePath = `${appPath.testData}/${fileName}`;
        const fileStream: Buffer = fs.readFileSync(filePath);
        const file: File = {
          size: fileStream.byteLength,
          path: filePath,
          name: fileName,
          type: 'application/octet-stream',
          toJSON(): FileJSON {
            return {} as FileJSON;
          },
        };
        return file;
      });
      files = _.zipObject(fileNameList, fileList);
    });

    it('uploadImage - normal case', () => {
      const renameSyncStub = sandbox.stub(fs, 'renameSync');

      imageService.uploadImage({ files });
      renameSyncStub.calledTwice.should.be.true;
      verify(imageRepository.createImages(anyOfClass(Array), anything())).once();
      const capturedImageList: DocumentDefinition<ImageDoc>[] = capture(imageRepository.createImages).last()[0];
      capturedImageList.map((capturedImage) => capturedImage.title).should.deep.equal(fileNameList);
    });

    it('uploadImage - failed to move', async () => {
      sandbox.stub(fs, 'renameSync').throws(new Error(commonTestData.simpleTexts[0]));

      const newPath: PathLike = `${config.get('path.appData')}${config.get('path.image')}`;
      await errorShouldBeThrown(
        new BlogError(
          BlogErrorCode.FILE_CANNOT_BE_MOVED,
          [`${appPath.testData}/${commonTestData.gifImage.title}`, `${path.resolve(newPath, commonTestData.gifImage.title)}`],
        ),
        async (_param) => imageService.uploadImage(_param),
        { files },
      );
    });
  });
});
