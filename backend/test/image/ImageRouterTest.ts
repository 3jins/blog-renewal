import supertest from 'supertest';
import { should } from 'chai';
import { Server } from 'http';
import { anything, instance, mock, when } from 'ts-mockito';
import ImageService from '@src/image/ImageService';
import { Container } from 'typedi';
import { endApp, startApp } from '../../src/app';
import { appPath } from '../data/testData';
import * as URL from '../../src/common/constant/URL';

const imageService: ImageService = mock(ImageService);
Container.set(ImageService, instance(imageService));
delete require.cache[require.resolve('@src/image/ImageRouter')];
const ImageRouter = require('@src/image/ImageRouter');

describe('Image router test', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  before(() => {
    should();
    server = startApp([ImageRouter.default]);
    request = supertest(server);
  });

  it(`${URL.PREFIX.API}${URL.ENDPOINT.IMAGE}`, async () => {
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

  after(() => endApp(server));
});
