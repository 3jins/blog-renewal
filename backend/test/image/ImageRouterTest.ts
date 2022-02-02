import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import http2 from 'http2';
import { Container } from 'typedi';
import { anything, instance, mock, when } from 'ts-mockito';
import ImageService from '@src/image/ImageService';
import { endApp } from '@src/app';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import * as URL from '@common/constant/URL';
import { appPath } from '@test/data/testData';
import { startAppForTest } from '@test/TestUtil';

const imageService: ImageService = mock(ImageService);
Container.set(ImageService, instance(imageService));
delete require.cache[require.resolve('@src/image/ImageRouter')];
const ImageRouter = require('@src/image/ImageRouter');

describe('Image router test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(async () => {
    should();
    server = await startAppForTest([ImageRouter.default]);
    request = supertest(server);
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  describe(`POST ${URL.PREFIX.API}${URL.ENDPOINT.IMAGE}`, async () => {
    it(`POST ${URL.PREFIX.API}${URL.ENDPOINT.IMAGE} - normal case`, async () => {
      const fileName = 'roseblade.png';
      const payload = { title: fileName };

      when(imageService.uploadImage(anything()))
        .thenResolve();

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.IMAGE}`)
        .field(payload)
        .attach(fileName, `${appPath.testData}/${fileName}`, { contentType: 'application/octet-stream' })
        .expect(201);
    });

    it(`${URL.PREFIX.API}${URL.ENDPOINT.IMAGE} - parameter error(file is absent)`, async () => {
      const fileName = 'roseblade.png';
      const payload = { title: fileName };

      when(imageService.uploadImage(anything()))
        .thenResolve();

      await request
        .post(`${URL.PREFIX.API}${URL.ENDPOINT.IMAGE}`)
        .field(payload)
        .expect(http2.constants.HTTP_STATUS_BAD_REQUEST)
        .expect((res) => {
          (!!(res.body.message)).should.be.true;
          res.body.message.should.equal(BlogErrorCode.FILE_NOT_UPLOADED.errorMessage);
        });
    });
  });

  after(() => endApp(server));
});
