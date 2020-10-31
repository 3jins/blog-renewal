import mongoose from 'mongoose';
import config from 'config';

export default (): mongoose.Connection => {
  const {
    url, port, dbName, connectionOptions,
  } = config.get('db');
  mongoose.set('useCreateIndex', true); // Use usecreateindex` instead of `ensureIndex`. See https://mongoosejs.com/docs/deprecations.html#ensureindex
  mongoose.connect(`mongodb://${url}:${port}/${dbName}`, connectionOptions);
  return mongoose.connection;
};
