import { should } from 'chai';
import BlogError from '@src/common/error/BlogError';
import { common as commonTestData, blogErrorCode as blogErrorCodeTestData } from '@test/data/testData';

describe('BlogError test', () => {
  before(() => should());

  it('BlogError test - code only', () => {
    const blogError: BlogError = new BlogError(blogErrorCodeTestData.TEST_ERROR);
    blogError.blogErrorCode.should.equal(blogErrorCodeTestData.TEST_ERROR);
    blogError.params.should.be.empty;
    blogError.stack!.should.contain(__filename);
  });

  it('BlogError test - with full parameters', () => {
    const { simpleTexts } = commonTestData;
    const blogError: BlogError = new BlogError(blogErrorCodeTestData.TEST_ERROR, [simpleTexts[0], simpleTexts[1]], simpleTexts[2]);
    blogError.blogErrorCode.should.equal(blogErrorCodeTestData.TEST_ERROR);
    blogError.params.should.deep.equal([simpleTexts[0], simpleTexts[1]]);
    blogError.stack!.should.contain(__filename);
  });
});
