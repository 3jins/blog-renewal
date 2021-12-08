import _ from 'lodash';
import sinon from 'sinon';
import { should } from 'chai';
import ImageService from '@src/image/ImageService';
import { File, FileJSON, Files } from 'formidable';
import fs from 'fs';
import ImageRepository from '@src/image/ImageRepository';
import { anyOfClass, anything, capture, instance, mock, verify } from 'ts-mockito';
import { ImageDoc } from '@src/image/Image';
import { ClientSession, Connection, DocumentDefinition } from 'mongoose';
import { appPath } from '../data/testData';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { abortTestTransaction, replaceUseTransactionForTest } from '@test/TestUtil';

describe('ImageService test', () => {
  let sandbox;
  let conn: Connection;
  let session: ClientSession;
  let imageService: ImageService;
  let imageRepository: ImageRepository;

  before(() => {
    imageRepository = mock(ImageRepository);
    imageService = new ImageService(instance(imageRepository));
    should();
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

  it('uploadImage test', () => {
    const renameSyncStub = sinon.stub(fs, 'renameSync');
    const fileNameList = ['iu-clap.gif', 'roseblade.png'];
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
    const files: Files = _.zipObject(fileNameList, fileList);

    imageService.uploadImage({ files });
    renameSyncStub.calledTwice.should.be.true;
    verify(imageRepository.createImages(anyOfClass(Array), anything())).once();
    const capturedImageList: DocumentDefinition<ImageDoc>[] = capture(imageRepository.createImages).last()[0];
    capturedImageList.map((capturedImage) => capturedImage.title).should.deep.equal(fileNameList);
  });
});
