import _ from 'lodash';
import { BlogError } from '@src/common/error/BlogError';

export default () => ({
  keyCodeMatchingTest: () => _.each(BlogError, (error, key) => error.code.should.equal(key)),
});
