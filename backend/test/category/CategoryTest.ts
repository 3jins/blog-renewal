import { ClientSession } from 'mongoose';
import { MongoError } from 'mongodb';
import { common as commonTestData } from '@test/data/testData';
import Category from '@src/category/Category';

export default (session: ClientSession) => ({
  createTest: async () => {
    const [{ _id: parentCategoryId }] = await Category.insertMany(
      [commonTestData.category2],
      { session },
    );
    await Category.insertMany([{
      ...commonTestData.category3,
      parentCategory: parentCategoryId,
    }], { session });

    const childCategory = await Category
      .findOne({ categoryNo: commonTestData.category3.categoryNo })
      .populate('parentCategory')
      .session(session)
      .exec();
    (childCategory !== null).should.be.true;
    childCategory!.categoryNo.should.equal(commonTestData.category3.categoryNo);
    childCategory!.name.should.equal(commonTestData.category3.name);
    const { parentCategory } = childCategory!;
    if (parentCategory instanceof Category) {
      parentCategory._id.equals(parentCategoryId).should.be.true;
      parentCategory.name.should.equal(commonTestData.category2.name);
      (parentCategory.level !== null).should.be.true;
      parentCategory.level!.should.equal(commonTestData.category2.level);
    }
  },

  createWithDuplicatedCategoryNoTest: async () => {
    const [category1] = await Category.insertMany([commonTestData.category3], { session });
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
    await Category.insertMany([commonTestData.category3], { session });
    await Category
      .deleteOne({ categoryNo: commonTestData.category3.categoryNo })
      .session(session);
    const results = await Category
      .find({ categoryNo: commonTestData.category3.categoryNo })
      .session(session);
    results.should.have.length(0);
  },
});
