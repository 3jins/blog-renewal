import { ClientSession, Connection, Types } from 'mongoose';
import { should } from 'chai';
import sinon from 'sinon';
import { createMongoMemoryReplSet, getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import { common as commonTestData } from '@test/data/testData';
import { abortTestTransaction, errorShouldBeThrown } from '@test/TestUtil';
import TagRepository from '@src/tag/TagRepository';
import {
  CreateTagRepoParamDto,
  DeleteTagRepoParamDto,
  FindTagRepoParamDto,
  UpdateTagRepoParamDto,
} from '@src/tag/dto/TagRepoParamDto';
import Tag, { TagDoc } from '@src/tag/Tag';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import PostMeta, { PostMetaDoc } from '@src/post/model/PostMeta';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

describe('TagRepository test', () => {
  let sandbox;
  let tagRepository: TagRepository;
  let conn: Connection;
  let replSet: MongoMemoryReplSet;
  let session: ClientSession;

  before(async () => {
    should();
    tagRepository = new TagRepository();
    replSet = await createMongoMemoryReplSet();
    conn = setConnection(replSet.getUri());
    sandbox = sinon.createSandbox();
  });

  beforeEach(async () => {
    session = await conn.startSession();
    session.startTransaction();
  });

  afterEach(async () => {
    await abortTestTransaction(sandbox, session);
  });

  after(async () => {
    await conn.close();
    await replSet.stop();
  });

  describe('findTag test', () => {
    let postMetaIdList;

    beforeEach(async () => {
      const tag1 = (await Tag.insertMany([commonTestData.tag1], { session }))[0]; // Spring
      const tag2 = (await Tag.insertMany([commonTestData.tag2], { session }))[0]; // 우시앞무선
      const tag3 = (await Tag.insertMany([commonTestData.tag3], { session }))[0]; // 넹비ㅓ

      const postMeta1 = (await PostMeta.insertMany([{
        postNo: 1,
        tagList: [tag1._id, tag3._id],
        createdDate: commonTestData.dateList[0],
      }], { session }))[0];
      const postMeta2 = (await PostMeta.insertMany([{
        postNo: 2,
        tagList: [tag3._id],
        createdDate: commonTestData.dateList[1],
      }], { session }))[0];
      const postMeta3 = (await PostMeta.insertMany([{
        postNo: 3,
        tagList: [tag2._id],
        createdDate: commonTestData.dateList[2],
      }], { session }))[0];
      postMetaIdList = [postMeta1._id.toString(), postMeta2._id.toString(), postMeta3._id.toString()];

      await Tag.updateOne({ _id: tag1._id }, { postMetaList: [postMetaIdList[0]] }, { session });
      await Tag.updateOne({ _id: tag2._id }, { postMetaList: [postMetaIdList[2]] }, { session });
      await Tag.updateOne({ _id: tag3._id }, { postMetaList: [postMetaIdList[0], postMetaIdList[1]] }, { session });
    });

    it('findTag - by exact name', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByNameDto: {
          nameList: [commonTestData.tag2.name, commonTestData.tag3.name],
          isOnlyExactNameFound: true,
        },
      };
      const tags: TagDoc[] = await tagRepository.findTag(paramDto, session);
      tags.should.have.lengthOf(2);
      tags[0].name.should.equal(commonTestData.tag3.name);
      tags[1].name.should.equal(commonTestData.tag2.name);
    });

    it('findTag - by name (like search)', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByNameDto: {
          nameList: ['시간 앞에'],
          isOnlyExactNameFound: false,
        },
      };
      const tags: TagDoc[] = await tagRepository.findTag(paramDto, session);
      tags.should.have.lengthOf(1);
      tags[0].name.should.equal(commonTestData.tag2.name);
    });

    it('findTag - by postMeta ID with AND condition', async () => { // here
      const paramDto: FindTagRepoParamDto = {
        findTagByPostMetaIdDto: {
          postMetaIdList: [postMetaIdList[0], postMetaIdList[1]],
          isAndCondition: true,
        },
      };

      const tags: TagDoc[] = await tagRepository.findTag(paramDto, session);
      tags.should.have.lengthOf(1);
      tags[0].name.should.equal(commonTestData.tag3.name);
    });

    it('findTag - by postMeta ID with OR condition', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByPostMetaIdDto: {
          postMetaIdList: [postMetaIdList[1], postMetaIdList[2]],
          isAndCondition: false,
        },
      };
      const tags: TagDoc[] = await tagRepository.findTag(paramDto, session);
      tags.should.have.lengthOf(2);
      tags[0].name.should.equal(commonTestData.tag3.name);
      tags[1].name.should.equal(commonTestData.tag2.name);
    });

    it('findTag - by name and postMeta ID', async () => {
      const paramDto: FindTagRepoParamDto = {
        findTagByPostMetaIdDto: {
          postMetaIdList: [postMetaIdList[0]],
          isAndCondition: true,
        },
        findTagByNameDto: {
          nameList: [commonTestData.tag3.name],
          isOnlyExactNameFound: true,
        },
      };
      const tags: TagDoc[] = await tagRepository.findTag(paramDto, session);
      tags.should.have.lengthOf(1);
      tags[0].name.should.equal(commonTestData.tag3.name);
    });

    it('findTag - with empty parameter', async () => {
      const tags: TagDoc[] = await tagRepository.findTag({}, session);
      tags.should.have.lengthOf(3);
    });
  });

  describe('createTag test', () => {
    let postMetaList;

    beforeEach(async () => {
      const tag = (await Tag.insertMany([commonTestData.tag2], { session }))[0]; // 우시앞무선

      postMetaList = (await PostMeta.insertMany([{
        postNo: 1,
        tagList: [tag._id],
        createdDate: commonTestData.dateList[0],
      }, {
        postNo: 2,
        createdDate: commonTestData.dateList[1],
      }], { session }))
        .map((postMeta) => postMeta.toObject());
    });

    it('createTag - without postMetaIdList', async () => {
      const paramDto: CreateTagRepoParamDto = {
        ...commonTestData.tag1,
      };

      await tagRepository.createTag(paramDto, session);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      tag!.should.not.be.empty;
      tag!.name.should.equal(commonTestData.tag1.name);
      tag!.postMetaList!.should.be.empty;

      const postMeta1: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post1V1.postNo }).session(session).lean();
      postMeta1!.tagList!.should.have.length(1); // should not be updated

      const postMeta2: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post2V1.postNo }).session(session).lean();
      postMeta2!.tagList!.should.have.length(0); // should not be updated
    });

    it('createTag - with postMetaIdList', async () => {
      const paramDto: CreateTagRepoParamDto = {
        ...commonTestData.tag1,
        postMetaList: [postMetaList[0]],
      };

      await tagRepository.createTag(paramDto, session);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      tag!.should.not.be.empty;
      tag!.name.should.equal(commonTestData.tag1.name);
      tag!.postMetaList!.should.deep.equal([postMetaList[0]._id]);

      const postMeta1: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post1V1.postNo }).session(session).lean();
      postMeta1!.tagList!.should.have.length(2);
      postMeta1!.tagList![1].should.deep.equal(tag!._id); // should be updated (added)

      const postMeta2: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post2V1.postNo }).session(session).lean();
      postMeta2!.tagList!.should.have.length(0); // should not be updated
    });
  });

  describe('updateTag test', () => {
    let tagIdList;
    let postMetaIdList;
    let postObjectIdList;

    beforeEach(async () => {
      const tag1 = (await Tag.insertMany([commonTestData.tag1], { session }))[0]; // Spring
      const tag2 = (await Tag.insertMany([commonTestData.tag2], { session }))[0]; // 우시앞무선

      const postMeta1 = (await PostMeta.insertMany([{
        postNo: 1,
        tagList: [tag1._id],
        createdDate: commonTestData.dateList[0],
      }], { session }))[0];
      const postMeta2 = (await PostMeta.insertMany([{
        postNo: 2,
        tagList: [tag1._id],
        createdDate: commonTestData.dateList[1],
      }], { session }))[0];
      const postMeta3 = (await PostMeta.insertMany([{
        postNo: 3,
        tagList: [tag2._id],
        createdDate: commonTestData.dateList[2],
      }], { session }))[0];

      tagIdList = [tag1._id, tag2._id];
      postMetaIdList = [postMeta1.id, postMeta2.id, postMeta3.id];
      postObjectIdList = [postMeta1._id, postMeta2._id, postMeta3._id];

      await Tag.updateOne({ _id: tag1._id }, { postMetaList: [postMetaIdList[0], postMetaIdList[1]] }, { session });
      await Tag.updateOne({ _id: tag2._id }, { postMetaList: [postMetaIdList[2]] }, { session });
    });

    it('updateTag - change name', async () => {
      const paramDto: UpdateTagRepoParamDto = {
        originalName: commonTestData.tag1.name,
        tagToBe: {
          name: commonTestData.tag3.name,
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      };

      await tagRepository.updateTag(paramDto, session);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag3.name }).session(session).lean();
      (tag !== null).should.be.true;
    });

    it('updateTag - change postMetaList', async () => {
      const paramDto: UpdateTagRepoParamDto = {
        originalName: commonTestData.tag1.name,
        tagToBe: {
          postMetaIdToBeAddedList: [postMetaIdList[2]],
          postMetaIdToBeRemovedList: [postMetaIdList[0]],
        },
      };

      await tagRepository.updateTag(paramDto, session);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      (tag !== null).should.be.true;
      tag!.postMetaList!.should.deep.equal([postObjectIdList[1], postObjectIdList[2]]); // postMeta1, postMeta2 -> postMeta2, postMeta3

      const postMeta1: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post1V1.postNo }).session(session).lean();
      postMeta1!.tagList!.should.be.empty;

      const postMeta2: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post2V1.postNo }).session(session).lean();
      postMeta2!.tagList!.should.deep.equal([tagIdList[0]]);

      const postMeta3: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post3.postNo }).session(session).lean();
      postMeta3!.tagList!.should.deep.equal([tagIdList[1], tagIdList[0]]);
    });

    it('updateTag - change name and postMetaList', async () => {
      const paramDto: UpdateTagRepoParamDto = {
        originalName: commonTestData.tag1.name,
        tagToBe: {
          name: commonTestData.tag3.name,
          postMetaIdToBeAddedList: [postMetaIdList[2]],
          postMetaIdToBeRemovedList: [postMetaIdList[0]],
        },
      };

      await tagRepository.updateTag(paramDto, session);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag3.name }).session(session).lean();
      (tag !== null).should.be.true;
      tag!.postMetaList!.should.deep.equal([postObjectIdList[1], postObjectIdList[2]]); // postMeta1, postMeta2 -> postMeta2, postMeta3

      const postMeta1: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post1V1.postNo }).session(session).lean();
      postMeta1!.tagList!.should.be.empty;

      const postMeta2: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post2V1.postNo }).session(session).lean();
      postMeta2!.tagList!.should.deep.equal([tagIdList[0]]);

      const postMeta3: (PostMetaDoc | null) = await PostMeta.findOne({ postNo: commonTestData.post3.postNo }).session(session).lean();
      postMeta3!.tagList!.should.deep.equal([tagIdList[1], tagIdList[0]]);
    });

    it('updateTag - with empty parameter: no change', async () => {
      const paramDto: UpdateTagRepoParamDto = {
        originalName: commonTestData.tag2.name,
        tagToBe: {
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      };
      await tagRepository.updateTag(paramDto, session);
      const tag1: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      const tag2: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag2.name }).session(session).lean();
      const tag3: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag3.name }).session(session).lean();
      (tag1 !== null).should.be.true;
      (tag2 !== null).should.be.true;
      (tag3 === null).should.be.true;
    });

    it('updateTag - with inexistent tag name', async () => {
      const inexistentName = 'Oh yeah oh shit 이런 건 처음 들어';
      const paramDto: UpdateTagRepoParamDto = {
        originalName: inexistentName,
        tagToBe: {
          name: '쿵쿵쿵 옆집 사람들은 날 싫어해',
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      };

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.TAG_NOT_FOUND, [inexistentName, 'name']),
        async (_paramDto) => tagRepository.updateTag(_paramDto, session),
        paramDto,
      );
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

      [testPost] = (await PostMeta.insertMany([{
        postNo: 1,
        tagList: [testTag._id, dummyTagId],
        createdDate: commonTestData.dateList[0],
      }], { session }));

      await Tag.updateOne({ _id: testTag._id }, { postMetaList: [testPost._id] }, { session });
    });

    it('deleteTag', async () => {
      const paramDto: DeleteTagRepoParamDto = {
        name: commonTestData.tag1.name,
      };

      await tagRepository.deleteTag(paramDto, session);

      const tag: (TagDoc | null) = await Tag.findOne({ name: commonTestData.tag1.name }).session(session).lean();
      (tag === null).should.be.true;

      const post: (PostMetaDoc | null) = await PostMeta.findOne({ _id: testPost._id }).session(session).lean();
      post!.tagList!.should.deep.equal([dummyTagId]);
    });
  });
});
