import _ from 'lodash';
import { Service } from 'typedi';
import { Types } from 'mongoose';
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

@Service()
export default class TagService {
  public constructor(private readonly tagRepository: TagRepository) {
  }

  public async findTag(paramDto: FindTagParamDto): Promise<TagDoc[]> {
    const repoParamDto: FindTagRepoParamDto = {};
    this.addNameQueryToFindTagRepoParamDto(repoParamDto, paramDto);
    this.addPostMetaIdQueryToFindTagRepoParamDto(repoParamDto, paramDto);
    return this.tagRepository.findTag(repoParamDto);
  }

  public async createTag(paramDto: CreateTagParamDto): Promise<string> {
    const { postMetaIdList } = paramDto;
    const postMetaList: Types.ObjectId[] = _.isNil(postMetaIdList)
      ? []
      : postMetaIdList!.map((postMetaId) => new Types.ObjectId(postMetaId));
    await this.tagRepository.createTag({
      postMetaList,
      ...paramDto,
    });

    const tagList: TagDoc[] = await this.tagRepository.findTag({
      findTagByNameDto: {
        nameList: [paramDto.name],
        isOnlyExactNameFound: true,
      },
    });
    if (_.isEmpty(tagList)) {
      throw new BlogError(BlogErrorCode.TAG_NOT_CREATED, [paramDto.name, 'name']);
    }
    return tagList[0].name;
  }

  public async updateTag(paramDto: UpdateTagParamDto): Promise<void> {
    if (_.isNil(paramDto.tagToBe) || _.isEmpty(_.values(paramDto.tagToBe))) {
      throw new BlogError(BlogErrorCode.PARAMETER_EMPTY);
    }
    return this.tagRepository.updateTag(this.makeUpdateTagRepoParamDto(paramDto));
  }

  public async deleteTag(paramDto: DeleteTagParamDto): Promise<void> {
    return this.tagRepository.deleteTag({ ...paramDto });
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
