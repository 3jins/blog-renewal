import { should } from 'chai';
import { capture, deepEqual, instance, mock, spy, verify } from 'ts-mockito';
import { Types } from 'mongoose';
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
import { errorShouldBeThrown } from '@test/TestUtil';

describe('TagService test', () => {
  let tagService: TagService;
  let tagRepository: TagRepository;
  let postMetaList: Types.ObjectId[];

  const {
    tag2: { name: tagName },
    objectIdList: postMetaIdList,
  } = commonTestData;

  before(() => {
    tagRepository = spy(mock(TagRepository));
    tagService = new TagService(instance(tagRepository));
    postMetaList = postMetaIdList.map((postMetaId) => new Types.ObjectId(postMetaId));
    should();
  });

  describe('findTag test', () => {
    it('findTag - with empty parameter', () => {
      const emptyParamDto: FindTagParamDto = {};
      tagService.findTag(emptyParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({}))).once();
    });

    it('findTag - by name only', () => {
      const nameOnlyParamDto: FindTagParamDto = {
        name: tagName,
        isOnlyExactNameFound: true,
      };
      tagService.findTag(nameOnlyParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({
        findTagByNameDto: {
          nameList: [tagName],
          isOnlyExactNameFound: true,
        },
      }))).once();
    });

    it('findTag - by postMetaIdList only', () => {
      const postMetaIdListOnlyParamDto: FindTagParamDto = {
        postMetaIdList,
        isAndCondition: true,
      };
      tagService.findTag(postMetaIdListOnlyParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({
        findTagByPostMetaIdDto: {
          postMetaIdList,
          isAndCondition: true,
        },
      }))).once();
    });

    it('findTag - with full parameter', () => {
      const fullParamDto: FindTagParamDto = {
        name: tagName,
        isOnlyExactNameFound: true,
        postMetaIdList,
        isAndCondition: true,
      };
      tagService.findTag(fullParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({
        findTagByNameDto: {
          nameList: [tagName],
          isOnlyExactNameFound: true,
        },
        findTagByPostMetaIdDto: {
          postMetaIdList,
          isAndCondition: true,
        },
      }))).once();
    });
  });

  describe('createTag test', () => {
    it('tag create test', async () => {
      const paramDto: CreateTagParamDto = {
        name: tagName,
        postMetaIdList,
      };
      await tagService.createTag(paramDto);

      const [repoParamDto] = capture<CreateTagRepoParamDto>(tagRepository.createTag).last();
      repoParamDto.name.should.equal(tagName);
      repoParamDto.postMetaList.should.deep.equal(postMetaList);
    });

    it('tag create test - without postMetaIdList', async () => {
      const paramDto: CreateTagParamDto = {
        name: tagName,
      };
      await tagService.createTag(paramDto);

      verify(tagRepository.createTag(deepEqual<CreateTagRepoParamDto>({
        name: tagName,
        postMetaList: [],
      })));
    });
  });

  describe('updateTag test', () => {
    it('tag update test', async () => {
      const paramDto: UpdateTagParamDto = {
        originalName: tagName,
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
      verify(tagRepository.updateTag(deepEqual(repoParamDto))).once();
    });

    it('tag update test - empty tagToBe', async () => {
      const paramDto: UpdateTagParamDto = {
        originalName: tagName,
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
        originalName: tagName,
        tagToBe: {
          name: commonTestData.simpleText,
        },
      };

      await tagService.updateTag(paramDto);
      verify(tagRepository.updateTag(deepEqual({
        originalName: tagName,
        tagToBe: {
          name: commonTestData.simpleText,
          postMetaIdToBeAddedList: [],
          postMetaIdToBeRemovedList: [],
        },
      })));
    });
  });

  describe('deleteTag test', () => {
    it('tag delete test', async () => {
      const paramDto: DeleteTagParamDto = {
        name: tagName,
      };
      await tagService.deleteTag(paramDto);

      const repoParamDto: DeleteTagRepoParamDto = { ...paramDto };
      verify(tagRepository.deleteTag(deepEqual(repoParamDto))).once();
    });
  });
});
