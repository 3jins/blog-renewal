const crypto = require('crypto');

function getTheSecret() {
  return `The secret was: ${crypto.randomInt(1024, 65535)}`;
}

module.exports = {
  getTheSecret,
};
