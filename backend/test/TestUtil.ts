/* eslint-disable mocha/no-exports */
import _ from 'lodash';
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

export const errorShouldBeThrownWithMessageCheck = async (
  errorShouldBe: Error,
  callback: Function,
  assertMessage: ((message: string) => void) | null,
  ...params: any[]
) => {
  let isAnyErrorThrown: boolean = false;
  try {
    await callback(...params);
  } catch (error) {
    isAnyErrorThrown = true;
    if (errorShouldBe instanceof BlogError) {
      if (_.isNil(assertMessage)) {
        errorShouldBe.equals(error).should.be.true;
      } else {
        errorShouldBe.equals(error, false);
        assertMessage((error as Error).message);
      }
    } else {
      (error as Error).name.should.equal(errorShouldBe.name);
      if (_.isNil(assertMessage)) {
        (error as Error).message.should.equal(errorShouldBe.message);
      } else {
        assertMessage((error as Error).message);
      }
    }
  }
  isAnyErrorThrown.should.be.true;
};

// Do not use this function for routers. Instead, use `expect` of supertest.
export const errorShouldBeThrown = async (
  errorShouldBe: Error,
  callback: Function,
  ...params: any[]
) => {
  await errorShouldBeThrownWithMessageCheck(errorShouldBe, callback, null, ...params);
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
