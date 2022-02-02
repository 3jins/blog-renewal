/**
 * This file is for temporary aid for using node-config with webpack.
 * This file should be removed and all the usage of this file should be replaced with the 'real' node-config module when the node-config bug is patched.
 * See this: https://github.com/lorenwest/node-config/wiki/Webpack-Usage#option-3
 */

// @ts-ignore
import configBundle from 'configBundle';

export const config = {
  get: (key: string) => configBundle[key],
};
