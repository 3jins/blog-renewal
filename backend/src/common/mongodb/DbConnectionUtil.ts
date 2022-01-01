import mongoose from 'mongoose';
import config from 'config';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

export const createMongoMemoryReplSet = async (): Promise<MongoMemoryReplSet> => {
  const { name, count, ip } = config.get('db');
  return MongoMemoryReplSet.create({
    replSet: {
      name, count, ip,
    },
  });
};

export const setConnection = (uri: string): mongoose.Connection => {
  const {
    connectionOptions,
  } = config.get('db');
  mongoose.set('useCreateIndex', true); // Use usecreateindex` instead of `ensureIndex`. See https://mongoosejs.com/docs/deprecations.html#ensureindex
  mongoose.connect(uri, connectionOptions);
  return mongoose.connection;
};

export const getConnection = (): mongoose.Connection => mongoose.connection;
