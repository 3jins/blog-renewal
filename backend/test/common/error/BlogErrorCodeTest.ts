import _ from 'lodash';
import { should } from 'chai';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

describe('BlogErrorCode test', () => {
  before(() => should());

  it('BlogErrorCode key code matching test', () => _.each(BlogErrorCode, (error, key) => error.code.should.equal(key)));
});
