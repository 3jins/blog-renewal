const crypto = require('crypto');
const { returnHello, returnGoodBye } = require('./myModule');

function getTheSecret() {
  return `The secret was: ${crypto.randomInt(1024, 65535)}`;
}

function greeting(name) {
  return `${returnHello()}, ${name}!\n${returnGoodBye()}, ${name}!`;
}

module.exports = {
  getTheSecret,
  greeting,
};
