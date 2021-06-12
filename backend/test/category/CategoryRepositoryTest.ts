import { ClientSession, Connection, Types } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, errorShouldBeThrown, replaceUseTransactionForTest } from '@test/TestUtil';
import CategoryRepository from '@src/category/CategoryRepository';
import {
  CreateCategoryRepoParamDto,
  DeleteCategoryRepoParamDto,
  FindCategoryRepoParamDto,
  UpdateCategoryRepoParamDto,
} from '@src/category/dto/CategoryRepoParamDto';
import Category, { CategoryDoc } from '@src/category/Category';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

describe('CategoryRepository test', () => {
  let sandbox;
  let categoryRepository: CategoryRepository;
  let conn: Connection;
  let session: ClientSession;

  before(() => {
    should();
    categoryRepository = new CategoryRepository();
    setConnection();
    conn = getConnection();
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    session = await conn.startSession();
    session.startTransaction();
    await replaceUseTransactionForTest(sandbox, session);
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
  });

  describe('findCategory test', () => {
    let catSwDev, catWeb, catBe, catFe, catMobile, catLife, catEtc; // eslint-disable-line
    let categoryTestDataList: Object[];

    beforeEach(async () => {
      categoryTestDataList = [
        commonTestData.category1,
        commonTestData.category2,
        commonTestData.category3,
        commonTestData.category4,
        commonTestData.category5,
        commonTestData.category6,
        commonTestData.category7,
      ];
      [catSwDev, catWeb, catBe, catFe, catMobile, catLife, catEtc] = await Category.insertMany(categoryTestDataList, { session });
      await Category.updateOne({ _id: catWeb._id }, { parentCategory: catSwDev._id }, { session });
      await Category.updateOne({ _id: catMobile._id }, { parentCategory: catSwDev._id }, { session });
      await Category.updateOne({ _id: catBe._id }, { parentCategory: catWeb._id }, { session });
      await Category.updateOne({ _id: catFe._id }, { parentCategory: catWeb._id }, { session });
    });

    it('findCategory - by parentCategory', async () => {
      const paramDto: FindCategoryRepoParamDto = {
        parentCategoryId: catSwDev.id,
      };
      const categories: CategoryDoc[] = await categoryRepository.findCategory(paramDto);
      categories.should.have.lengthOf(2);
      categories[0].categoryNo.should.equal(catWeb.categoryNo);
      categories[1].categoryNo.should.equal(catMobile.categoryNo);
    });

    it('findCategory - by categoryNo', async () => {
      const paramDto: FindCategoryRepoParamDto = {
        categoryNo: 5,
      };
      const categories: CategoryDoc[] = await categoryRepository.findCategory(paramDto);
      categories.should.have.lengthOf(1);
      categories[0].categoryNo.should.equal(catMobile.categoryNo);
    });

    it('findCategory - by name', async () => {
      const paramDto: FindCategoryRepoParamDto = {
        name: catBe.name,
      };
      const categories: CategoryDoc[] = await categoryRepository.findCategory(paramDto);
      categories.should.have.lengthOf(1);
      categories[0].categoryNo.should.equal(catBe.categoryNo);
    });

    it('findCategory - by level', async () => {
      const paramDto: FindCategoryRepoParamDto = {
        level: 0,
      };
      const categories: CategoryDoc[] = await categoryRepository.findCategory(paramDto);
      categories.should.have.lengthOf(3);
      categories[0].categoryNo.should.equal(catSwDev.categoryNo);
      categories[1].categoryNo.should.equal(catLife.categoryNo);
      categories[2].categoryNo.should.equal(catEtc.categoryNo);
    });

    it('findCategory - with empty parameter', async () => {
      const categories: CategoryDoc[] = await categoryRepository.findCategory({});
      categories.should.have.lengthOf(categoryTestDataList.length);
    });
  });

  describe('createCategory test', () => {
    let catSwDev;
    beforeEach(async () => {
      [catSwDev] = await Category.insertMany([commonTestData.category1], { session });
    });

    it('createCategory - with parentCategory', async () => {
      const paramDto: CreateCategoryRepoParamDto = {
        name: commonTestData.category3.name,
        parentCategory: catSwDev.id,
      };

      await categoryRepository.createCategory(paramDto);

      const category: (CategoryDoc | null) = await Category
        .findOne({ name: commonTestData.category3.name })
        .session(session)
        .lean();
      category!.should.not.be.empty;
      category!.name.should.equal(commonTestData.category3.name);
      category!.level!.should.equal(catSwDev.level + 1);
      category!.parentCategory!.should.deep.equal(new Types.ObjectId(catSwDev.id));
    });

    it('createCategory - with wrong parentCategory', async () => {
      const paramDto: CreateCategoryRepoParamDto = {
        name: commonTestData.category3.name,
        parentCategory: new Types.ObjectId(commonTestData.objectIdList[0]),
      };

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [commonTestData.objectIdList[0], 'id']),
        async (_paramDto) => categoryRepository.createCategory(_paramDto),
        paramDto,
      );
    });

    it('createCategory - without parentCategory', async () => {
      const paramDto: CreateCategoryRepoParamDto = {
        name: commonTestData.category3.name,
      };

      await categoryRepository.createCategory(paramDto);

      const category: (CategoryDoc | null) = await Category
        .findOne({ name: commonTestData.category3.name })
        .session(session)
        .lean();
      category!.should.not.be.empty;
      (category!.parentCategory === null).should.be.true;
      category!.name.should.equal(commonTestData.category3.name);
      category!.level!.should.equal(0);
    });
  });

  describe('getNextCategoryNo test', () => {
    it('getNextCategoryNo - get defatul value', async () => {
      const paramDto: CreateCategoryRepoParamDto = {
        name: commonTestData.category1.name,
      };
      await categoryRepository.createCategory(paramDto);
      const category: (CategoryDoc | null) = await Category
        .findOne({ name: commonTestData.category1.name })
        .session(session)
        .lean();
      category!.categoryNo.should.equal(1);
    });
  });

  describe('updateCategory test', () => {
    let catSwDev, catWeb, catBe, catFe; // eslint-disable-line
    beforeEach(async () => {
      [catSwDev, catWeb, catBe, catFe] = await Category.insertMany([
        commonTestData.category1,
        commonTestData.category2,
        commonTestData.category3,
        commonTestData.category4,
      ], { session });
      await Category.updateOne({ _id: catWeb._id }, { parentCategory: catSwDev._id }, { session });
      await Category.updateOne({ _id: catBe._id }, { parentCategory: catWeb._id }, { session });
      await Category.updateOne({ _id: catFe._id }, { parentCategory: catWeb._id }, { session });
    });

    it('updateCategory - change name', async () => {
      const paramDto: UpdateCategoryRepoParamDto = {
        categoryNo: catWeb.categoryNo,
        categoryToBe: {
          name: commonTestData.category6.name,
        },
      };

      await categoryRepository.updateCategory(paramDto);

      const categoryExpectedNotToBeFound: (CategoryDoc | null) = await Category
        .findOne({ name: commonTestData.category2.name }).session(session).lean();
      const categoryExpectedToBeFound: (CategoryDoc | null) = await Category
        .findOne({ name: commonTestData.category6.name }).session(session).lean();
      (categoryExpectedNotToBeFound === null).should.be.true;
      (categoryExpectedToBeFound !== null).should.be.true;
      categoryExpectedToBeFound!.categoryNo.should.equal(commonTestData.category2.categoryNo);
    });

    it('updateCategory - change parentCategory', async () => {
      const paramDto: UpdateCategoryRepoParamDto = {
        categoryNo: catFe.categoryNo,
        categoryToBe: {
          parentCategoryId: catSwDev.id,
        },
      };

      await categoryRepository.updateCategory(paramDto);

      const category: (CategoryDoc | null) = await Category
        .findOne({ name: commonTestData.category4.name }).session(session).lean();
      (category !== null).should.be.true;
      category!.categoryNo.should.equal(commonTestData.category4.categoryNo);
      category!.parentCategory!.toString().should.equal(catSwDev.id);
      category!.level!.should.equal(catSwDev.level + 1);
    });
  });

  describe('deleteCategory test', () => {
    let catWeb, catBe, catFe; // eslint-disable-line
    beforeEach(async () => {
      [catWeb, catBe, catFe] = await Category.insertMany([
        commonTestData.category2,
        commonTestData.category3,
        commonTestData.category4,
      ], { session });
      await Category.updateOne({ _id: catBe._id }, { parentCategory: catWeb._id }, { session });
      await Category.updateOne({ _id: catFe._id }, { parentCategory: catWeb._id }, { session });
    });

    it('deleteCategory - no child', async () => {
      const paramDto: DeleteCategoryRepoParamDto = {
        categoryNo: catBe.categoryNo,
      };

      await categoryRepository.deleteCategory(paramDto);
      const category: (CategoryDoc | null) = await Category.findOne({ name: catBe.name }).session(session).lean();
      (category === null).should.be.true;
    });

    it('deleteCategory - try deleting a category containing children', async () => {
      const paramDto: DeleteCategoryRepoParamDto = {
        categoryNo: catWeb.categoryNo,
      };

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_WITH_CHILDREN_CANNOT_BE_DELETED, [`${catBe.categoryNo}, ${catFe.categoryNo}`]),
        async (_paramDto) => categoryRepository.deleteCategory(_paramDto),
        paramDto,
      );
    });

    it('deleteCategory - with wrong categoryNo', async () => {
      const paramDto: DeleteCategoryRepoParamDto = {
        categoryNo: 1073741824,
      };

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [String(paramDto.categoryNo), 'categoryNo']),
        async (_paramDto) => categoryRepository.deleteCategory(_paramDto),
        paramDto,
      );
    });
  });
});
