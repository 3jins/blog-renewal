import { should } from 'chai';
import { anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { ClientSession, Connection, Types } from 'mongoose';
import TagService from '@src/tag/TagService';
import TagRepository from '@src/tag/TagRepository';
import { CreateTagParamDto, DeleteTagParamDto, FindTagParamDto, UpdateTagParamDto } from '@src/tag/dto/TagParamDto';
import {
  CreateTagRepoParamDto,
  DeleteTagRepoParamDto,
  FindTagRepoParamDto,
  UpdateTagRepoParamDto,
} from '@src/tag/dto/TagRepoParamDto';
import { common as commonTestData } from '@test/data/testData';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { abortTestTransaction, errorShouldBeThrown, replaceUseTransactionForTest } from '@test/TestUtil';
import { TagDoc } from '@src/tag/Tag';
import { getConnection, setConnection } from '@src/common/mongodb/DbConnectionUtil';
import sinon from 'sinon';
import { FindTagResponseDto } from '@src/tag/dto/TagResponseDto';
import { PostMetaDoc } from '@src/post/model/PostMeta';

describe('TagService test', () => {
  let sandbox;
  let conn: Connection;
  let session: ClientSession;
  let tagService: TagService;
  let tagRepository: TagRepository;
  let postMetaList: Types.ObjectId[];

  const {
    tag1: { name: tagName1 },
    tag2: { name: tagName2 },
    objectIdList: postMetaIdList,
  } = commonTestData;

  before(() => {
    tagRepository = spy(mock(TagRepository));
    tagService = new TagService(instance(tagRepository));
    postMetaList = postMetaIdList.map((postMetaId) => new Types.ObjectId(postMetaId));
    should();
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
    it('findTag - with empty parameter', async () => {
      const emptyParamDto: FindTagParamDto = {};
      when(tagRepository.findTag(anything(), anything()))
        .thenResolve([]);

      await tagService.findTag(emptyParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({}), anything())).once();
    });

    it('findTag - by name only', async () => {
      const nameOnlyParamDto: FindTagParamDto = {
        name: tagName2,
        isOnlyExactNameFound: true,
      };
      when(tagRepository.findTag(anything(), anything()))
        .thenResolve([]);

      await tagService.findTag(nameOnlyParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({
        findTagByNameDto: {
          nameList: [tagName2],
          isOnlyExactNameFound: true,
        },
      }), anything())).once();
    });

    it('findTag - by postMetaIdList only', async () => {
      const postMetaIdListOnlyParamDto: FindTagParamDto = {
        postMetaIdList,
        isAndCondition: true,
      };
      when(tagRepository.findTag(anything(), anything()))
        .thenResolve([]);

      await tagService.findTag(postMetaIdListOnlyParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({
        findTagByPostMetaIdDto: {
          postMetaIdList,
          isAndCondition: true,
        },
      }), anything())).once();
    });

    it('findTag - with full parameter', async () => {
      const fullParamDto: FindTagParamDto = {
        name: tagName2,
        isOnlyExactNameFound: true,
        postMetaIdList,
        isAndCondition: true,
      };
      when(tagRepository.findTag(anything(), anything()))
        .thenResolve([]);

      await tagService.findTag(fullParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({
        findTagByNameDto: {
          nameList: [tagName2],
          isOnlyExactNameFound: true,
        },
        findTagByPostMetaIdDto: {
          postMetaIdList,
          isAndCondition: true,
        },
      }), anything())).once();
    });

    it('findTag - response mapping test', async () => {
      const { postMeta1, postMeta3 } = commonTestData;
      const paramDto: FindTagParamDto = {};
      when(tagRepository.findTag(anything(), anything()))
        .thenResolve([{
          name: tagName1,
          postMetaList: [postMeta1, postMeta3],
        } as TagDoc, {
          name: tagName2,
          postMetaList: [] as PostMetaDoc[],
        } as TagDoc]);

      const responseDto: FindTagResponseDto = await tagService.findTag(paramDto);
      responseDto.tagList.should.have.lengthOf(2);
      responseDto.tagList[0].name.should.equal(tagName1);
      responseDto.tagList[0].postList.should.have.lengthOf(2);
      responseDto.tagList[0].postList[0].postNo.should.equal(postMeta1.postNo);
      responseDto.tagList[0].postList[0].createdDate.should.equal(postMeta1.createdDate);
      responseDto.tagList[0].postList[0].isDeleted.should.equal(postMeta1.isDeleted);
      responseDto.tagList[0].postList[0].commentCount.should.equal(postMeta1.commentCount);
      responseDto.tagList[0].postList[0].isPrivate.should.equal(postMeta1.isPrivate);
      responseDto.tagList[0].postList[0].isDeprecated.should.equal(postMeta1.isDeprecated);
      responseDto.tagList[0].postList[0].isDraft.should.equal(postMeta1.isDraft);
      responseDto.tagList[0].postList[1].postNo.should.equal(postMeta3.postNo);
      responseDto.tagList[0].postList[1].createdDate.should.equal(postMeta3.createdDate);
      responseDto.tagList[0].postList[1].isDeleted.should.equal(postMeta3.isDeleted);
      responseDto.tagList[0].postList[1].commentCount.should.equal(postMeta3.commentCount);
      responseDto.tagList[0].postList[1].isPrivate.should.equal(postMeta3.isPrivate);
      responseDto.tagList[0].postList[1].isDeprecated.should.equal(postMeta3.isDeprecated);
      responseDto.tagList[0].postList[1].isDraft.should.equal(postMeta3.isDraft);
      responseDto.tagList[1].name.should.equal(tagName2);
      responseDto.tagList[1].postList.should.have.lengthOf(0);
    });
  });

  describe('createTag test', () => {
    it('tag create test', async () => {
      const paramDto: CreateTagParamDto = {
        name: tagName2,
        postMetaIdList,
      };
      when(tagRepository.findTag(anything(), anything()))
        .thenResolve([{ name: tagName2 } as TagDoc]);

      const result: string = await tagService.createTag(paramDto);

      const [repoParamDto] = capture<CreateTagRepoParamDto, ClientSession>(tagRepository.createTag).last();
      repoParamDto.name.should.equal(tagName2);
      repoParamDto.postMetaList.should.deep.equal(postMetaList);
      result.should.be.equal(tagName2);
    });

    it('tag create test - without postMetaIdList', async () => {
      const paramDto: CreateTagParamDto = {
        name: tagName2,
      };
      when(tagRepository.findTag(anything(), anything()))
        .thenResolve([{ name: tagName2 } as TagDoc]);

      const result: string = await tagService.createTag(paramDto);

      verify(tagRepository.createTag(deepEqual<CreateTagRepoParamDto>({
        name: tagName2,
        postMetaList: [],
      }), anything()));
      result.should.be.equal(tagName2);
    });

    it('tag create test - when failed to create', async () => {
      const paramDto: CreateTagParamDto = {
        name: tagName2,
        postMetaIdList,
      };
      when(tagRepository.findTag(anything(), anything()))
        .thenResolve([]);

      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.TAG_NOT_CREATED, [tagName2, 'name']),
        (_paramDto) => tagService.createTag(_paramDto),
        paramDto,
      );
    });
  });

  describe('updateTag test', () => {
    it('tag update test', async () => {
      const paramDto: UpdateTagParamDto = {
        originalName: tagName2,
        tagToBe: {
          name: '돈 명예 평화 야\'망 사\'랑 또 뭐가 있더라',
          postMetaIdToBeAddedList: postMetaIdList.splice(0, 2),
          postMetaIdToBeRemovedList: postMetaIdList.splice(2, 1),
        },
      };
      await tagService.updateTag(paramDto);

      const repoParamDto: UpdateTagRepoParamDto = {
        ...paramDto,
        tagToBe: {
          ...paramDto.tagToBe,
          postMetaIdToBeAddedList: paramDto.tagToBe.postMetaIdToBeAddedList!,
          postMetaIdToBeRemovedList: paramDto.tagToBe.postMetaIdToBeRemovedList!,
        },
      };
      verify(tagRepository.updateTag(deepEqual(repoParamDto), anything())).once();
    });

    it('tag update test - empty tagToBe', async () => {
      const paramDto: UpdateTagParamDto = {
        originalName: tagName2,
        tagToBe: {},
      };
      await errorShouldBeThrown(
        new BlogError(BlogErrorCode.PARAMETER_EMPTY),
        async (_paramDto) => tagService.updateTag(_paramDto),
        paramDto,
      );
    });

    it('tag update test - without postMetaIdToBeAddedList and postMetaIdToBeRemovedList', async () => {
      const paramDto: UpdateTagParamDto = {
        originalName: tagName2,
        tagToBe: {
          name: commonTestData.simpleTexts[0],
        },
      };

      await tagService.updateTag(paramDto);
      verify(tagRepository.updateTag(deepEqual({
        originalName: tagName2,
        tagToBe: {
          name: commonTestData.simpleTexts[0],
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      }), anything()));
    });
  });

  describe('deleteTag test', () => {
    it('tag delete test', async () => {
      const paramDto: DeleteTagParamDto = {
        name: tagName2,
      };
      await tagService.deleteTag(paramDto);

      const repoParamDto: DeleteTagRepoParamDto = { ...paramDto };
      verify(tagRepository.deleteTag(deepEqual(repoParamDto), anything())).once();
    });
  });
});
