import _ from 'lodash';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

export default () => ({
  keyCodeMatchingTest: () => _.each(BlogErrorCode, (error, key) => error.code.should.equal(key)),
});
