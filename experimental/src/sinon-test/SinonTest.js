const assert = require('assert');
const sinon = require('sinon');
const crypto = require('crypto');
const { getTheSecret } = require('./moduleUnderTest');

describe('moduleUnderTest', function () {
  describe('when the secret is 3', function () {
    it('should be returned with a string prefix', function () {
      sinon.stub(crypto, 'randomInt').returns(3);
      // const mock = sinon.mock(dependencyModule, 'getSecretNumber').withArgs(1).returns(4);
      // mock.getSecretNumber(1).withArgs(1)
      const result = getTheSecret();
      assert.equal(result, 'The secret was: 3');
    });
  });
});
