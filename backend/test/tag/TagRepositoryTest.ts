import { ClientSession, Connection, Types } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, replaceUseTransactionForTest } from '@test/TestUtil';
import TagRepository from '@src/tag/TagRepository';
import {
  CreateTagRepoParamDto,
  DeleteTagRepoParamDto,
  FindTagRepoParamDto,
  UpdateTagRepoParamDto,
} from '@src/tag/dto/TagRepoParamDto';
import Tag, { TagDoc } from '@src/tag/Tag';
import Post, { PostDoc } from '@src/post/Post';

describe('TagRepository test', () => {
  let sandbox;
  let tagRepository: TagRepository;
  let conn: Connection;
  let session: ClientSession;

  before(() => {
    should();
    tagRepository = new TagRepository();
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

  describe('findTag test', () => {
    let postIdList;

    beforeEach(async () => {
      const tag1 = (await Tag.insertMany([commonTestData.tag1], { session }))[0]; // Spring
      const tag2 = (await Tag.insertMany([commonTestData.tag2], { session }))[0]; // 우시앞무선
      const tag3 = (await Tag.insertMany([commonTestData.tag3], { session }))[0]; // 넹비ㅓ

      const post1 = (await Post.insertMany([{
        ...commonTestData.post1,
        tagList: [tag1._id, tag3._id],
      }], { session }))[0];
      const post2 = (await Post.insertMany([{
        ...commonTestData.post2,
        tagList: [tag3._id],
      }], { session }))[0];
      const post3 = (await Post.insertMany([{
        ...commonTestData.post3,
        tagList: [tag2._id],
      }], { session }))[0];
      postIdList = [post1._id.toString(), post2._id.toString(), post3._id.toString()];

      await Tag.updateOne({ _id: tag1._id }, { postList: [postIdList[0]] }, { session });
      await Tag.updateOne({ _id: tag2._id }, { postList: [postIdList[2]] }, { session });
      await Tag.updateOne({ _id: tag3._id }, { postList: [postIdList[0], postIdList[1]] }, { session });
    });

    it('findTag - by exact name', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByNameDto: {
          name: commonTestData.tag2.name,
          isOnlyExactNameFound: true,
        },
      };
      const tags: TagDoc[] = await tagRepository.findTag(paramDto);
      tags.should.have.lengthOf(1);
      tags[0].name.should.equal(commonTestData.tag2.name);
    });

    it('findTag - by name (like search)', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByNameDto: {
          name: '시간 앞에',
          isOnlyExactNameFound: false,
        },
      };
      const tags: TagDoc[] = await tagRepository.findTag(paramDto);
      tags.should.have.lengthOf(1);
      tags[0].name.should.equal(commonTestData.tag2.name);
    });

    it('findTag - by post ID with AND condition', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByPostIdDto: {
          postIdList: [postIdList[0]],
          isAndCondition: true,
        },
      };

      const tags: TagDoc[] = await tagRepository.findTag(paramDto);
      tags.should.have.lengthOf(2);
      tags[0].name.should.equal(commonTestData.tag1.name);
      tags[1].name.should.equal(commonTestData.tag3.name);
    });

    it('findTag - by post ID with OR condition', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByPostIdDto: {
          postIdList: [postIdList[1], postIdList[2]],
          isAndCondition: false,
        },
      };
      const tags: TagDoc[] = await tagRepository.findTag(paramDto);
      tags.should.have.lengthOf(2);
      tags[0].name.should.equal(commonTestData.tag2.name);
      tags[1].name.should.equal(commonTestData.tag3.name);
    });

    it('findTag - by name and post ID', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByPostIdDto: {
          postIdList: [postIdList[0]],
          isAndCondition: true,
        },
        findTagByNameDto: {
          name: commonTestData.tag3.name,
          isOnlyExactNameFound: true,
        },
      };
      const tags: TagDoc[] = await tagRepository.findTag(paramDto);
      tags.should.have.lengthOf(1);
      tags[0].name.should.equal(commonTestData.tag3.name);
    });

    it('findTag - with empty parameter', async () => {
      const tags: TagDoc[] = await tagRepository.findTag({});
      tags.should.have.lengthOf(3);
    });
  });

  describe('createTag test', () => {
    let postList;

    beforeEach(async () => {
      const tag = (await Tag.insertMany([commonTestData.tag2], { session }))[0]; // 우시앞무선

      postList = (await Post.insertMany([{
        ...commonTestData.post1,
        tagList: [tag._id],
      }, {
        ...commonTestData.post2,
      }], { session }))
        .map((post) => post.toObject());
    });

    it('createTag - without postIdList', async () => {
      const paramDto: CreateTagRepoParamDto = {
        ...commonTestData.tag1,
      };

      await tagRepository.createTag(paramDto);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      tag!.should.not.be.empty;
      tag!.name.should.equal(commonTestData.tag1.name);
      tag!.postList!.should.be.empty;

      const post1: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post1.postNo }).session(session).lean();
      post1!.tagList!.should.have.length(1); // should not be updated

      const post2: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post2.postNo }).session(session).lean();
      post2!.tagList!.should.have.length(0); // should not be updated
    });

    it('createTag - with postIdList', async () => {
      const paramDto: CreateTagRepoParamDto = {
        ...commonTestData.tag1,
        postList: [postList[0]],
      };

      await tagRepository.createTag(paramDto);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      tag!.should.not.be.empty;
      tag!.name.should.equal(commonTestData.tag1.name);
      tag!.postList!.should.deep.equal([postList[0]._id]);

      const post1: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post1.postNo }).session(session).lean();
      post1!.tagList!.should.have.length(2);
      post1!.tagList![1].should.deep.equal(tag!._id); // should be updated (added)

      const post2: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post2.postNo }).session(session).lean();
      post2!.tagList!.should.have.length(0); // should not be updated
    });
  });

  describe('updateTag test', () => {
    let tagIdList;
    let postIdList;
    let postObjectIdList;

    beforeEach(async () => {
      const tag1 = (await Tag.insertMany([commonTestData.tag1], { session }))[0]; // Spring
      const tag2 = (await Tag.insertMany([commonTestData.tag2], { session }))[0]; // 우시앞무선

      const post1 = (await Post.insertMany([{
        ...commonTestData.post1,
        tagList: [tag1._id],
      }], { session }))[0];
      const post2 = (await Post.insertMany([{
        ...commonTestData.post2,
        tagList: [tag1._id],
      }], { session }))[0];
      const post3 = (await Post.insertMany([{
        ...commonTestData.post3,
        tagList: [tag2._id],
      }], { session }))[0];

      tagIdList = [tag1._id, tag2._id];
      postIdList = [post1.id, post2.id, post3.id];
      postObjectIdList = [post1._id, post2._id, post3._id];

      await Tag.updateOne({ _id: tag1._id }, { postList: [postIdList[0], postIdList[1]] }, { session });
      await Tag.updateOne({ _id: tag2._id }, { postList: [postIdList[2]] }, { session });
    });

    it('updateTag - change name', async () => {
      const paramDto: UpdateTagRepoParamDto = {
        originalName: commonTestData.tag1.name,
        tagToBe: {
          name: commonTestData.tag3.name,
        },
      };

      await tagRepository.updateTag(paramDto);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag3.name }).session(session).lean();
      (tag !== null).should.be.true;
    });

    it('updateTag - change postList', async () => {
      const paramDto: UpdateTagRepoParamDto = {
        originalName: commonTestData.tag1.name,
        tagToBe: {
          postList: [postIdList[1], postIdList[2]],
        },
      };

      await tagRepository.updateTag(paramDto);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      (tag !== null).should.be.true;
      tag!.postList!.should.deep.equal([postObjectIdList[1], postObjectIdList[2]]); // post1, post2 -> post2, post3

      const post1: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post1.postNo }).session(session).lean();
      post1!.tagList!.should.be.empty;

      const post2: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post2.postNo }).session(session).lean();
      post2!.tagList!.should.deep.equal([tagIdList[0]]);

      const post3: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post3.postNo }).session(session).lean();
      post3!.tagList!.should.deep.equal([tagIdList[1], tagIdList[0]]);
    });

    it('updateTag - change name and postList', async () => {
      const paramDto: UpdateTagRepoParamDto = {
        originalName: commonTestData.tag1.name,
        tagToBe: {
          name: commonTestData.tag3.name,
          postList: [postIdList[1], postIdList[2]],
        },
      };

      await tagRepository.updateTag(paramDto);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag3.name }).session(session).lean();
      (tag !== null).should.be.true;
      tag!.postList!.should.deep.equal([postObjectIdList[1], postObjectIdList[2]]); // post1, post2 -> post2, post3

      const post1: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post1.postNo }).session(session).lean();
      post1!.tagList!.should.be.empty;

      const post2: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post2.postNo }).session(session).lean();
      post2!.tagList!.should.deep.equal([tagIdList[0]]);

      const post3: (PostDoc | null) = await Post.findOne({ postNo: commonTestData.post3.postNo }).session(session).lean();
      post3!.tagList!.should.deep.equal([tagIdList[1], tagIdList[0]]);
    });

    it('updateTag - with empty parameter', async () => {
      const paramDto: UpdateTagRepoParamDto = {
        originalName: commonTestData.tag2.name,
        tagToBe: {},
      };
      await tagRepository.updateTag(paramDto);
      const tag1: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      const tag2: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag2.name }).session(session).lean();
      const tag3: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag3.name }).session(session).lean();
      (tag1 !== null).should.be.true;
      (tag2 !== null).should.be.true;
      (tag3 === null).should.be.true;
    });
  });

  describe('deleteTag test', () => {
    let dummyTagId;
    let testPost;
    let testTag;

    before(() => {
      dummyTagId = new Types.ObjectId(commonTestData.objectIdList[0]);
    });

    beforeEach(async () => {
      [testTag] = (await Tag.insertMany([commonTestData.tag1], { session })); // Spring

      [testPost] = (await Post.insertMany([{
        ...commonTestData.post1,
        tagList: [testTag._id, dummyTagId],
      }], { session }));

      await Tag.updateOne({ _id: testTag._id }, { postList: [testPost._id] }, { session });
    });

    it('deleteTag', async () => {
      const paramDto: DeleteTagRepoParamDto = {
        name: commonTestData.tag1.name,
      };

      await tagRepository.deleteTag(paramDto);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      (tag === null).should.be.true;

      const post: (PostDoc | null) = await Post.findOne({ _id: testPost._id }).session(session).lean();
      post!.tagList!.should.deep.equal([dummyTagId]);
    });
  });
});
