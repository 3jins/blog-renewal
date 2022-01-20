import _ from 'lodash';
import sinon, { SinonSpy } from 'sinon';
import { should } from 'chai';
import { ExtendableContext, Request, Response } from 'koa';
import { File } from 'formidable';
import koaBody from 'koa-body';
import { leaveRequestLog } from '@src/common/middleware/RequestLogger';
import { common as commonTestData } from '@test/data/testData';
import * as LoggingUtil from '@src/common/logging/LoggingUtil';
import LogLevel from '@src/common/logging/LogLevel';

describe('RequestLogger Test', () => {
  let sandbox;

  before(() => {
    should();
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => koaBody());

  afterEach(() => {
    sandbox.restore();
  });

  it('leaveRequestLog - body O, files O', async () => {
    // @ts-ignore
    const ctx: ExtendableContext = {
      // @ts-ignore
      request: {
        ip: commonTestData.ipList[0],
        body: { test: commonTestData.simpleTexts[0] },
        files: {
          file: {
            name: commonTestData.simpleTexts[1],
          } as File,
        },
      } as Request,
      response: {
        get(field: string): string {
          if (_.isEqual(field, 'X-Response-Time')) {
            return JSON.stringify(commonTestData.dateList[0]);
          }
          return '';
        },
      } as Response,
      method: 'GET',
      url: commonTestData.simpleTexts[2],
    };
    const leaveLogSpy: SinonSpy = sandbox.spy(LoggingUtil, 'leaveLog');

    // eslint-disable-next-line no-empty-function
    await leaveRequestLog()(ctx, async () => {});

    leaveLogSpy.firstCall.args[0]
      .should.equal(`GET ${commonTestData.simpleTexts[2]} - ${JSON.stringify(commonTestData.dateList[0])} from ${commonTestData.ipList[0]}`);
    leaveLogSpy.firstCall.args[1].should.equal(LogLevel.INFO);

    leaveLogSpy.secondCall.args[0]
      .should.equal(`request body: {"test":"${commonTestData.simpleTexts[0]}"}`);
    leaveLogSpy.secondCall.args[1].should.equal(LogLevel.INFO);

    leaveLogSpy.thirdCall.args[0]
      .should.equal(`request files: {"file":{"name":"${commonTestData.simpleTexts[1]}"}}`);
    leaveLogSpy.thirdCall.args[1].should.equal(LogLevel.INFO);
  });

  it('leaveRequestLog - body O, files X', async () => {
    // @ts-ignore
    const ctx: ExtendableContext = {
      // @ts-ignore
      request: {
        ip: commonTestData.ipList[0],
        body: { test: commonTestData.simpleTexts[0] },
      } as Request,
      response: {
        get(field: string): string {
          if (_.isEqual(field, 'X-Response-Time')) {
            return JSON.stringify(commonTestData.dateList[0]);
          }
          return '';
        },
      } as Response,
      method: 'GET',
      url: commonTestData.simpleTexts[2],
    };
    const leaveLogSpy: SinonSpy = sandbox.spy(LoggingUtil, 'leaveLog');

    // eslint-disable-next-line no-empty-function
    await leaveRequestLog()(ctx, async () => {});

    leaveLogSpy.firstCall.args[0]
      .should.equal(`GET ${commonTestData.simpleTexts[2]} - ${JSON.stringify(commonTestData.dateList[0])} from ${commonTestData.ipList[0]}`);
    leaveLogSpy.firstCall.args[1].should.equal(LogLevel.INFO);

    leaveLogSpy.secondCall.args[0]
      .should.equal(`request body: {"test":"${commonTestData.simpleTexts[0]}"}`);
    leaveLogSpy.secondCall.args[1].should.equal(LogLevel.INFO);
  });

  it('leaveRequestLog - body X, files O', async () => {
    // @ts-ignore
    const ctx: ExtendableContext = {
      // @ts-ignore
      request: {
        ip: commonTestData.ipList[0],
        files: {
          file: {
            name: commonTestData.simpleTexts[1],
          } as File,
        },
      } as Request,
      response: {
        get(field: string): string {
          if (_.isEqual(field, 'X-Response-Time')) {
            return JSON.stringify(commonTestData.dateList[0]);
          }
          return '';
        },
      } as Response,
      method: 'GET',
      url: commonTestData.simpleTexts[2],
    };
    const leaveLogSpy: SinonSpy = sandbox.spy(LoggingUtil, 'leaveLog');

    // eslint-disable-next-line no-empty-function
    await leaveRequestLog()(ctx, async () => {});

    leaveLogSpy.firstCall.args[0]
      .should.equal(`GET ${commonTestData.simpleTexts[2]} - ${JSON.stringify(commonTestData.dateList[0])} from ${commonTestData.ipList[0]}`);
    leaveLogSpy.firstCall.args[1].should.equal(LogLevel.INFO);

    leaveLogSpy.secondCall.args[0]
      .should.equal(`request files: {"file":{"name":"${commonTestData.simpleTexts[1]}"}}`);
    leaveLogSpy.secondCall.args[1].should.equal(LogLevel.INFO);
  });
});
