import { ClientSession } from 'mongoose';
import fs from 'fs';
import { File, FileJSON } from 'formidable';
import detect from 'detect-port';
import Router from '@koa/router';
import { startApp } from '@src/app';
import * as TransactionUtil from '@src/common/mongodb/TransactionUtil';
import BlogError from '@src/common/error/BlogError';
import { appPath } from '@test/data/testData';
import config from 'config';
import { Server } from 'http';

export const startAppForTest = async (routerList: Router[]): Promise<Server> => {
  const { port } = config.get('server');
  let portInUse = port;
  let alternativePort;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    alternativePort = await detect(portInUse); // eslint-disable-line no-await-in-loop
    if (portInUse === alternativePort) {
      break;
    }
    portInUse = alternativePort;
  }
  return startApp(routerList, alternativePort);
};

export const replaceUseTransactionForTest = async (sandbox, session: ClientSession): Promise<any> => sandbox.replace(
  TransactionUtil,
  'useTransaction',
  (callback: Function): Promise<any> => callback(session),
);

export const abortTestTransaction = async (sandbox, session: ClientSession): Promise<void> => {
  await session.abortTransaction();
  await session.endSession();
  sandbox.restore();
};

const assertThrownErrorIsExpectedBlogError = (errorThrown: BlogError, errorShouldBe: BlogError) => {
  errorThrown.blogErrorCode.should.equal(errorShouldBe.blogErrorCode);
  errorThrown.params.should.deep.equal(errorShouldBe.params);
  errorThrown.name.should.equal(errorShouldBe.name);
  errorThrown.message.should.equal(errorShouldBe.message);
};

const assertThrownErrorIsExpectedError = (errorThrown: Error, errorShouldBe: Error) => {
  errorThrown.name.should.equal(errorShouldBe.name);
  errorThrown.message.should.equal(errorShouldBe.message);
};

// Do not use this function for routers. Instead, use `expect` of supertest.
export const errorShouldBeThrown = async (errorShouldBe: Error, callback: Function, ...params: any[]) => {
  let isAnyErrorThrown: boolean = false;
  try {
    await callback(...params);
  } catch (error) {
    isAnyErrorThrown = true;
    if (errorShouldBe instanceof BlogError) {
      (error instanceof BlogError).should.be.true;
      assertThrownErrorIsExpectedBlogError(error as BlogError, errorShouldBe);
    } else {
      assertThrownErrorIsExpectedError(error as Error, errorShouldBe);
    }
  }
  isAnyErrorThrown.should.be.true;
};

export const extractFileInfoFromRawFile = (fileName: string): { file: File, fileContent: string } => {
  const filePath = `${appPath.testData}/${fileName}`;
  const fileStream: Buffer = fs.readFileSync(filePath);
  const fileContent: string = fileStream.toString();
  const fileStat: fs.Stats = fs.statSync(filePath);
  const file: File = {
    size: fileStream.byteLength,
    path: filePath,
    name: fileName,
    type: 'application/octet-stream',
    lastModifiedDate: fileStat.mtime,
    toJSON(): FileJSON {
      return {} as FileJSON;
    },
  };
  return { file, fileContent };
};
