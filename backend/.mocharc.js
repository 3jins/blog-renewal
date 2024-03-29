process.env.NODE_ENV = 'test';

module.exports = {
  diff: true,
  extension: ['ts'],
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 2000,
  ui: 'bdd',
  require: ['ts-node/register', 'node_modules/tsconfig-paths/register'],
  parallel: false,
  spec: ['test', 'test/common/*/*.ts'],
};
