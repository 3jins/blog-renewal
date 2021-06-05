import { ClientSession, Schema } from 'mongoose';
import { common as commonTestData } from '@test/data/testData';
import Comment, { CommentDoc } from '@src/comment/Comment';
import Member from '@src/member/Member';
import Post from '@src/post/Post';

const createComments = async (postId: Schema.Types.ObjectId, session: ClientSession): Promise<Array<CommentDoc>> => {
  const [masterMember, guestMember1, guestMember2] = await Member.insertMany(
    [commonTestData.masterMember, commonTestData.guestMember1, commonTestData.guestMember2],
    { session },
  );
  const [comment1] = await Comment.insertMany([{
    ...commonTestData.comment1,
    post: postId,
    member: guestMember2._id,
    isPostAuthor: false,
  }], { session });
  const [comment2] = await Comment.insertMany([{
    ...commonTestData.comment2,
    post: postId,
    member: guestMember1._id,
    isPostAuthor: false,
  }], { session });
  const [comment3] = await Comment.insertMany([{
    ...commonTestData.comment3,
    post: postId,
    member: masterMember._id,
    refComment: comment1._id,
    isPostAuthor: true,
  }], { session });
  const [comment4] = await Comment.insertMany([{
    ...commonTestData.comment4,
    post: postId,
    member: guestMember2._id,
    refComment: comment3._id,
    isPostAuthor: false,
  }], { session });
  return [comment1, comment2, comment3, comment4];
};

export default (session: ClientSession) => ({
  createTest: async () => {
    const littleBitAgo = Date.now();
    const [{ _id: postId }] = await Post.insertMany([commonTestData.post1], { session });
    await createComments(postId, session);

    const comments = await Comment
      .find({ post: postId })
      .populate('post')
      .populate('member')
      .populate({
        path: 'refComment',
        populate: ['member', 'post'],
      })
      .session(session);

    comments.should.have.length(4);
    comments.reduce((prevDate, comment) => {
      comment.post.should.be.instanceOf(Post);
      comment.member.should.be.instanceOf(Member);
      (comment.createdDate !== null).should.be.true;
      comment.createdDate!.getTime().should.be.at.least(prevDate);
      return comment.createdDate!.getTime();
    }, littleBitAgo);

    (comments[3].refComment !== null).should.be.true;
    comments[3].refComment!.should.be.instanceOf(Comment);
    if (comments[3].refComment instanceof Comment) {
      comments[3].refComment._id.equals(comments[2]._id).should.be.true;
      comments[3].refComment.content.should.equal(comments[2].content);
      comments[3].refComment.post.should.be.instanceOf(Post);
      comments[3].refComment.member.should.be.instanceOf(Member);
      if (comments[3].refComment.member instanceof Member && comments[2].member instanceof Comment) {
        comments[3].refComment.post.should.equal(comments[2].post);
        comments[3].refComment.member.should.equal(comments[2].member);
      }
    }

    (comments[2].refComment !== null).should.be.true;
    comments[2].refComment!.should.be.instanceOf(Comment);
    if (comments[2].refComment instanceof Comment) {
      comments[2].refComment._id.equals(comments[0]._id).should.be.true;
      comments[2].refComment.content.should.equal(comments[0].content);
      comments[2].refComment.post.should.be.instanceOf(Post);
      comments[2].refComment.member.should.be.instanceOf(Member);
      if (comments[2].refComment.member instanceof Member && comments[0].member instanceof Comment) {
        comments[2].refComment.post.should.equal(comments[0].post);
        comments[2].refComment.member.should.equal(comments[0].member);
      }
    }

    (comments[1].refComment === null).should.be.true;

    (comments[0].refComment === null).should.be.true;
  },
});
