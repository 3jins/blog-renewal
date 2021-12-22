const assert = require('assert');
const sinon = require('sinon');
const crypto = require('crypto');
const MyModule = require('./myModule');
const { getTheSecret } = require('./moduleUnderTest');

describe('moduleUnderTest', function() {
  describe('stubbing test', function() {
    it('should be returned with a string prefix', function() {
      sinon.stub(crypto, 'randomInt').returns(3);
      // const mock = sinon.mock(dependencyModule, 'getSecretNumber').withArgs(1).returns(4);
      // mock.getSecretNumber(1).withArgs(1)
      const result = getTheSecret();
      assert.equal(result, 'The secret was: 3');
    });

    it('stubbing twice test', function() {
      sinon.stub(crypto, 'randomInt')
        .onFirstCall().returns(3)
        .onSecondCall().returns(4)
        .onCall(2).returns(5)
        .onCall(3).returns(6);
      assert.equal(getTheSecret(), 'The secret was: 3');
      assert.equal(getTheSecret(), 'The secret was: 4');
      assert.equal(getTheSecret(), 'The secret was: 5');
      assert.equal(getTheSecret(), 'The secret was: 6');
    });

    it('stubbing self-made module', function() {
      const returnHelloStub = sinon.stub(MyModule, 'returnHello').returns('Hi');
      const returnGoodByeStub = sinon.stub(MyModule, 'returnGoodBye').returns('Adieu');

      delete require.cache[require.resolve('./moduleUnderTest')];
      const { greeting } = require('./moduleUnderTest');

      const greetingText = greeting('Minkyu');
      assert.equal(greetingText, 'Hi, Minkyu!\nAdieu, Minkyu!');
      assert.equal(returnHelloStub.calledOnce, true);
      assert.equal(returnGoodByeStub.calledOnce, true);
    });
  });
});
