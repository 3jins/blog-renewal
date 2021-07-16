import { ClientSession } from 'mongoose';
import { common as commonTestData } from '@test/data/testData';
import Tag from '@src/tag/Tag';
import PostMeta from '@src/post/model/PostMeta';

export default (session: ClientSession) => ({
  updateTest: async () => {
    const [newTag] = await Tag.insertMany([commonTestData.tag1], { session });
    const newPosts = await PostMeta.insertMany([{
      postNo: commonTestData.post1.postNo,
      tagList: [newTag._id],
    }, {
      ...commonTestData.post2,
      tagList: [newTag._id],
    }], { session });
    await Tag.updateOne({ name: newTag.name }, { postMetaList: newPosts.map((newPost) => newPost._id) }, { session });

    const tag = await Tag
      .findOne({ name: commonTestData.tag1.name })
      .populate('postList')
      .session(session)
      .exec();

    (tag !== null).should.be.true;
    tag!._id.equals(newTag._id).should.be.true;
    JSON.stringify(tag!.postMetaList).should.equal(JSON.stringify(newPosts));
  },
});
