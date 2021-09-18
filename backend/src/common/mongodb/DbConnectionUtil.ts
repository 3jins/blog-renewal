import mongoose from 'mongoose';
import config from 'config';

export const setConnection = (): void => {
  const {
    url, port, dbName, connectionOptions,
  } = config.get('db');
  mongoose.connect(`mongodb://${url}:${port}/${dbName}`, connectionOptions);
};

export const getConnection = (): mongoose.Connection => mongoose.connection;
