import sinon, { SinonStub } from 'sinon';
import { should } from 'chai';
import * as App from '@src/app';
import CategoryRouter from '@src/category/CategoryRouter';
import HomeRouter from '@src/home/HomeRouter';
import ImageRouter from '@src/image/ImageRouter';
import PostRouter from '@src/post/PostRouter';
import PostPreviewRouter from '@src/post/PostPreviewRouter';
import SeriesRouter from '@src/series/SeriesRouter';
import TagRouter from '@src/tag/TagRouter';

describe('index test', () => {
  let sandbox;
  let connectToDbStub: SinonStub;
  let startAppStub: SinonStub;

  before(() => {
    should();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('starting point', () => {
    connectToDbStub = sandbox.stub(App, 'connectToDb');
    startAppStub = sandbox.stub(App, 'startApp');
    delete require.cache[require.resolve('@src/index')];
    // eslint-disable-next-line global-require
    require('@src/index');

    connectToDbStub.calledOnce.should.be.true;
    startAppStub.calledOnce.should.be.true;
    const routerTypeList = [CategoryRouter, HomeRouter, ImageRouter, PostRouter, PostPreviewRouter, SeriesRouter, TagRouter].map((router) => typeof router);
    const argumentRouterTypeList = startAppStub.firstCall.firstArg.map((router) => typeof router);
    argumentRouterTypeList.should.deep.equal(routerTypeList);
  });
});
