import { ClientSession } from 'mongoose';
import { common as commonTestData } from '@test/data/testData';
import Category, { CategoryDoc } from '@src/category/Category';
import Image, { ImageDoc } from '@src/image/Image';
import Post, { PostDoc } from '@src/post/Post';
import Series, { SeriesDoc } from '@src/series/Series';
import Tag, { TagDoc } from '@src/tag/Tag';

interface CreatedData {
  newPosts: Array<PostDoc>;
  newTags: Array<TagDoc>;
  newCategory: CategoryDoc;
  newSeries: SeriesDoc;
  newImage: ImageDoc;
}

const createData = async (session: ClientSession): Promise<CreatedData> => {
  const ret: CreatedData = {
    newTags: await Tag.create([commonTestData.tag1], { session }),
    newCategory: (await Category.create([commonTestData.childCategory], { session }))[0],
    newSeries: (await Series.create([commonTestData.series], { session }))[0],
    newPosts: [],
    newImage: (await Image.create([commonTestData.pngImage], { session }))[0],
  };
  ret.newPosts = await Post.create([{
    ...commonTestData.post1,
    tagList: ret.newTags.map((tag) => tag._id),
    category: ret.newCategory._id,
    thumbnailImage: ret.newImage._id,
  }, {
    ...commonTestData.post2,
    tagList: ret.newTags.map((tag) => tag._id),
    category: ret.newCategory._id,
    series: ret.newSeries._id,
  }, {
    ...commonTestData.post2En,
    tagList: ret.newTags.map((tag) => tag._id),
    category: ret.newCategory._id,
    series: ret.newSeries._id,
  }], { session });

  return ret;
};

export default (session: ClientSession) => ({
  createTest: async () => {
    const littleBitAgo = Date.now();
    const {
      newPosts, newTags, newCategory, newSeries, newImage,
    }: CreatedData = await createData(session);

    const post1 = await Post
      .findOne({ postNo: commonTestData.post1.postNo })
      .populate('category')
      .populate('tagList')
      .populate('series')
      .populate('thumbnailImage')
      .session(session)
      .exec();
    const post2 = await Post
      .findOne({
        postNo: commonTestData.post2.postNo,
        language: commonTestData.post2.language,
      })
      .populate('category')
      .populate('tagList')
      .populate('series')
      .session(session)
      .exec();
    const post2En = await Post
      .findOne({
        postNo: commonTestData.post2.postNo,
        language: commonTestData.post2En.language,
      })
      .populate('category')
      .populate('tagList')
      .populate('series')
      .session(session)
      .exec();

    (post1 !== null).should.be.true;
    post1!._id.equals(newPosts[0]._id).should.be.true;
    (post1!.createdDate !== null).should.be.true;
    post1!.createdDate!.getTime().should.be.at.least(littleBitAgo);
    JSON.stringify(post1!.category).should.equal(JSON.stringify(newCategory));
    JSON.stringify(post1!.tagList).should.equal(JSON.stringify(newTags));
    (post1!.thumbnailImage !== null).should.be.true;
    JSON.stringify(post1!.thumbnailImage).should.equal(JSON.stringify(newImage));
    (post1!.series === null).should.be.true;
    (post2 !== null).should.be.true;
    post2!._id.equals(newPosts[1]._id).should.be.true;
    (post2!.createdDate !== null).should.be.true;
    post2!.createdDate!.getTime().should.be.at.least(post1!.createdDate!.getTime());
    JSON.stringify(post2!.category).should.equal(JSON.stringify(newCategory));
    JSON.stringify(post2!.tagList).should.equal(JSON.stringify(newTags));
    JSON.stringify(post2!.series).should.equal(JSON.stringify(newSeries));
    post2!.postNo.should.equal(post2En!.postNo);
    JSON.stringify(post2!.category).should.equal(JSON.stringify(post2En!.category));
    JSON.stringify(post2!.tagList).should.equal(JSON.stringify(post2En!.tagList));
    JSON.stringify(post2!.series).should.equal(JSON.stringify(post2En!.series));
    post2!._id.should.not.equal(post2En!._id);
    post2!.title.should.not.equal(post2En!.title);
    post2!.rawContent.should.not.equal(post2En!.rawContent);
    post2!.renderedContent.should.not.equal(post2En!.renderedContent);
    post2!.language.should.not.equal(post2En!.language);
  },
});
