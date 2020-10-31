import { ClientSession } from 'mongoose';
import { common as commonTestData } from '@test/data/testData';
import Post from '@src/post/Post';
import Tag from '@src/tag/Tag';

export default (session: ClientSession) => ({
  updateTest: async () => {
    const [newTag] = await Tag.create([commonTestData.tag], { session });
    const newPosts = await Post.create([{
      ...commonTestData.post1,
      tagList: [newTag._id],
    }, {
      ...commonTestData.post2,
      tagList: [newTag._id],
    }], { session });
    await Tag.updateOne({ name: newTag.name }, { postList: newPosts.map((newPost) => newPost._id) }, { session });

    const tag = await Tag
      .findOne({ name: commonTestData.tag.name })
      .populate('postList')
      .session(session)
      .exec();

    (tag !== null).should.be.true;
    tag!._id.equals(newTag._id).should.be.true;
    JSON.stringify(tag!.postList).should.equal(JSON.stringify(newPosts));
  },
});
