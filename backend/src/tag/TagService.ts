import _ from 'lodash';
import { Service } from 'typedi';
import { ClientSession, Types } from 'mongoose';
import { CreateTagParamDto, DeleteTagParamDto, FindTagParamDto, UpdateTagParamDto } from '@src/tag/dto/TagParamDto';
import {
  FindTagByNameDto,
  FindTagByPostMetaIdDto,
  FindTagRepoParamDto,
  UpdateTagRepoParamDto,
} from '@src/tag/dto/TagRepoParamDto';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import TagRepository from '@src/tag/TagRepository';
import { TagDoc } from '@src/tag/Tag';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import { FindTagResponseDto, TagDto } from '@src/tag/dto/TagResponseDto';

@Service()
export default class TagService {
  public constructor(private readonly tagRepository: TagRepository) {
  }

  public async findTag(paramDto: FindTagParamDto): Promise<FindTagResponseDto> {
    return useTransaction(async (session: ClientSession) => {
      const repoParamDto: FindTagRepoParamDto = {};
      this.addNameQueryToFindTagRepoParamDto(repoParamDto, paramDto);
      this.addPostMetaIdQueryToFindTagRepoParamDto(repoParamDto, paramDto);
      const tagDocList: TagDoc[] = await this.tagRepository.findTag(repoParamDto, session);
      return this.convertToFindTagResponseDto(tagDocList);
    });
  }

  private convertToFindTagResponseDto(tagDocList: TagDoc[]): FindTagResponseDto {
    const tagDtoList: TagDto[] = tagDocList.map((tagDoc: TagDoc) => {
      const { name, postMetaList } = tagDoc;
      const tagDto: TagDto = { name, postList: postMetaList };
      return tagDto;
    });
    return { tagList: tagDtoList };
  }

  public async createTag(paramDto: CreateTagParamDto): Promise<string> {
    return useTransaction(async (session: ClientSession) => {
      const { postMetaIdList } = paramDto;
      const postMetaList: Types.ObjectId[] = _.isNil(postMetaIdList)
        ? []
        : postMetaIdList!.map((postMetaId) => new Types.ObjectId(postMetaId));
      await this.tagRepository.createTag({
        postMetaList,
        ...paramDto,
      }, session);

      const tagList: TagDoc[] = await this.tagRepository.findTag({
        findTagByNameDto: {
          nameList: [paramDto.name],
          isOnlyExactNameFound: true,
        },
      }, session);
      if (_.isEmpty(tagList)) {
        throw new BlogError(BlogErrorCode.TAG_NOT_CREATED, [paramDto.name, 'name']);
      }
      return tagList[0].name;
    });
  }

  public async updateTag(paramDto: UpdateTagParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      if (_.isNil(paramDto.tagToBe) || _.isEmpty(_.values(paramDto.tagToBe))) {
        throw new BlogError(BlogErrorCode.PARAMETER_EMPTY);
      }
      return this.tagRepository.updateTag(this.makeUpdateTagRepoParamDto(paramDto), session);
    });
  }

  public async deleteTag(paramDto: DeleteTagParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => this.tagRepository
      .deleteTag({ ...paramDto }, session));
  }

  private addNameQueryToFindTagRepoParamDto(repoParamDto: FindTagRepoParamDto, paramDto: FindTagParamDto): void {
    const { name, isOnlyExactNameFound } = paramDto;
    if (!_.isNil(name) && !_.isNil(isOnlyExactNameFound)) {
      const findTagByNameDto: FindTagByNameDto = { nameList: [name!], isOnlyExactNameFound: isOnlyExactNameFound! };
      Object.assign(repoParamDto, { findTagByNameDto });
    }
  }

  private addPostMetaIdQueryToFindTagRepoParamDto(repoParamDto: FindTagRepoParamDto, paramDto: FindTagParamDto): void {
    const { postMetaIdList, isAndCondition } = paramDto;
    if (!_.isNil(postMetaIdList) && !_.isNil(isAndCondition)) {
      const findTagByPostMetaIdDto: FindTagByPostMetaIdDto = {
        postMetaIdList: postMetaIdList!,
        isAndCondition: isAndCondition!,
      };
      Object.assign(repoParamDto, { findTagByPostMetaIdDto });
    }
  }

  private makeUpdateTagRepoParamDto(paramDto: UpdateTagParamDto): UpdateTagRepoParamDto {
    const { originalName, tagToBe } = paramDto;
    const { postMetaIdToBeAddedList, postMetaIdToBeRemovedList } = tagToBe;

    _.isNil({});
    return {
      originalName,
      tagToBe: {
        ...tagToBe,
        postMetaIdToBeAddedList: _.isNil(postMetaIdToBeAddedList) ? [] : postMetaIdToBeAddedList!,
        postMetaIdToBeRemovedList: _.isNil(postMetaIdToBeRemovedList) ? [] : postMetaIdToBeRemovedList!,
      },
    };
  }
}
