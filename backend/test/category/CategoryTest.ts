import { ClientSession } from 'mongoose';
import { MongoError } from 'mongodb';
import { common as commonTestData } from '@test/data/testData';
import Category from '@src/category/Category';

export default (session: ClientSession) => ({
  createTest: async () => {
    const [{ _id: parentCategoryId }] = await Category.insertMany(
      [commonTestData.parentCategory],
      { session },
    );
    await Category.insertMany([{
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
    const [category1] = await Category.insertMany([commonTestData.childCategory], { session });
    Category
      .insertMany([{
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
    await Category.insertMany([commonTestData.childCategory], { session });
    await Category
      .deleteOne({ categoryNo: commonTestData.childCategory.categoryNo })
      .session(session);
    const results = await Category
      .find({ categoryNo: commonTestData.childCategory.categoryNo })
      .session(session);
    results.should.have.length(0);
  },
});
