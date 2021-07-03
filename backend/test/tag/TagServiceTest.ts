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
  let postList: Types.ObjectId[];

  const {
    tag2: { name: tagName },
    objectIdList: postIdList,
  } = commonTestData;

  before(() => {
    tagRepository = spy(mock(TagRepository));
    tagService = new TagService(instance(tagRepository));
    postList = postIdList.map((postId) => new Types.ObjectId(postId));
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
          name: tagName,
          isOnlyExactNameFound: true,
        },
      }))).once();
    });

    it('findTag - by postIdList only', () => {
      const postIdListOnlyParamDto: FindTagParamDto = {
        postIdList,
        isAndCondition: true,
      };
      tagService.findTag(postIdListOnlyParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({
        findTagByPostIdDto: {
          postIdList,
          isAndCondition: true,
        },
      }))).once();
    });

    it('findTag - with full parameter', () => {
      const fullParamDto: FindTagParamDto = {
        name: tagName,
        isOnlyExactNameFound: true,
        postIdList,
        isAndCondition: true,
      };
      tagService.findTag(fullParamDto);
      verify(tagRepository.findTag(deepEqual<FindTagRepoParamDto>({
        findTagByNameDto: {
          name: tagName,
          isOnlyExactNameFound: true,
        },
        findTagByPostIdDto: {
          postIdList,
          isAndCondition: true,
        },
      }))).once();
    });
  });

  describe('createTag test', () => {
    it('tag create test', async () => {
      const paramDto: CreateTagParamDto = {
        name: tagName,
        postIdList,
      };
      await tagService.createTag(paramDto);

      const [repoParamDto] = capture<CreateTagRepoParamDto>(tagRepository.createTag).last();
      repoParamDto.name.should.equal(tagName);
      repoParamDto.postList.should.deep.equal(postList);
    });

    it('tag create test - without postIdList', async () => {
      const paramDto: CreateTagParamDto = {
        name: tagName,
      };
      await tagService.createTag(paramDto);

      verify(tagRepository.createTag(deepEqual<CreateTagRepoParamDto>({
        name: tagName,
        postList: [],
      })));
    });
  });

  describe('updateTag test', () => {
    it('tag update test', async () => {
      const paramDto: UpdateTagParamDto = {
        originalName: tagName,
        tagToBe: {
          name: '돈 명예 평화 야\'망 사\'랑 또 뭐가 있더라',
          postIdToBeAddedList: postIdList.splice(0, 2),
          postIdToBeRemovedList: postIdList.splice(2, 1),
        },
      };
      await tagService.updateTag(paramDto);

      const repoParamDto: UpdateTagRepoParamDto = {
        ...paramDto,
        tagToBe: {
          ...paramDto.tagToBe,
          postIdToBeAddedList: paramDto.tagToBe.postIdToBeAddedList!,
          postIdToBeRemovedList: paramDto.tagToBe.postIdToBeRemovedList!,
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

    it('tag update test - without postIdToBeAddedList and postIdToBeRemovedList', async () => {
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
          postIdToBeAddedList: [],
          postIdToBeRemovedList: [],
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
