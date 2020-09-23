import { ClientSession } from 'mongoose';
import { common as commonTestData } from '../data/testData';
import { Category } from '../../src/model';
import { MongoError } from 'mongodb';

export default (session: ClientSession) => ({
  createTest: async () => {
    const [{ _id: parentCategoryId }] = await Category.create([commonTestData.parentCategory], { session });
    await Category.create([{
      ...commonTestData.childCategory,
      parentCategory: parentCategoryId,
    }], { session });

    const childCategory = await Category
      .findOne({ categoryNo: commonTestData.childCategory.categoryNo })
      .populate('parentCategory')
      .session(session)
      .exec();
    (childCategory !== null).should.be.true;
    childCategory!.categoryNo.should.equal(commonTestData.childCategory.categoryNo);
    childCategory!.name.should.equal(commonTestData.childCategory.name);
    const { parentCategory } = childCategory!;
    if (parentCategory instanceof Category) {
      parentCategory._id.equals(parentCategoryId).should.be.true;
      parentCategory.name.should.equal(commonTestData.parentCategory.name);
      (parentCategory.level !== null).should.be.true;
      parentCategory.level!.should.equal(0);
    }
  },

  createWithDuplicatedCategoryNoTest: async () => {
    const [category1] = await Category.create([commonTestData.childCategory], { session });
    Category
      .create([{
        categoryNo: category1.categoryNo,
        name: commonTestData.duplicatedCategory.name,
      }], { session })
      .catch((e: MongoError) => {
        e.should.haveOwnProperty('code');
        (e.code !== null).should.be.true;
        e.code!.should.equal(11000);
      });
  },

  deleteTest: async () => {
    const [childCategory] = await Category.create([commonTestData.childCategory], { session });
    await Category
      .deleteOne({ categoryNo: commonTestData.childCategory.categoryNo })
      .session(session);
    const results = await Category
      .find({ categoryNo: commonTestData.childCategory.categoryNo })
      .session(session);
    results.should.have.length(0);
  },
});
