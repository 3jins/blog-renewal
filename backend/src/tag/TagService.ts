import _ from 'lodash';
import { Service } from 'typedi';
import { Types } from 'mongoose';
import { CreateTagParamDto, DeleteTagParamDto, FindTagParamDto, UpdateTagParamDto } from '@src/tag/dto/TagParamDto';
import { FindTagByNameDto, FindTagByPostIdDto, FindTagRepoParamDto } from '@src/tag/dto/TagRepoParamDto';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import TagRepository from '@src/tag/TagRepository';
import { TagDoc } from '@src/tag/Tag';

@Service()
export default class TagService {
  public constructor(private readonly tagRepository: TagRepository) {
  }

  public findTag = async (paramDto: FindTagParamDto): Promise<TagDoc[]> => {
    const repoParamDto: FindTagRepoParamDto = {};
    this.addNameQueryToFindTagRepoParamDto(repoParamDto, paramDto);
    this.addPostIdQueryToFindTagRepoParamDto(repoParamDto, paramDto);
    return this.tagRepository.findTag(repoParamDto);
  };

  private addNameQueryToFindTagRepoParamDto = (repoParamDto: FindTagRepoParamDto, paramDto: FindTagParamDto): void => {
    const { name, isOnlyExactNameFound } = paramDto;
    if (!_.isNil(name) && !_.isNil(isOnlyExactNameFound)) {
      const findTagByNameDto: FindTagByNameDto = { name: name!, isOnlyExactNameFound: isOnlyExactNameFound! };
      Object.assign(repoParamDto, { findTagByNameDto });
    }
  };

  private addPostIdQueryToFindTagRepoParamDto = (repoParamDto: FindTagRepoParamDto, paramDto: FindTagParamDto): void => {
    const { postIdList, isAndCondition } = paramDto;
    if (!_.isNil(postIdList) && !_.isNil(isAndCondition)) {
      const findTagByPostIdDto: FindTagByPostIdDto = { postIdList: postIdList!, isAndCondition: isAndCondition! };
      Object.assign(repoParamDto, { findTagByPostIdDto });
    }
  }

  public createTag = async (paramDto: CreateTagParamDto): Promise<void> => {
    const { postIdList } = paramDto;
    const postList: Types.ObjectId[] = _.isNil(postIdList) ? [] : postIdList.map((postId) => new Types.ObjectId(postId));
    return this.tagRepository.createTag({
      postList,
      ...paramDto,
    });
  };

  public updateTag = async (paramDto: UpdateTagParamDto): Promise<void> => {
    if (_.isNil(paramDto.tagToBe) || _.isEmpty(_.values(paramDto.tagToBe))) {
      throw new BlogError(BlogErrorCode.PARAMETER_EMPTY);
    }
    return this.tagRepository.updateTag({
      ...paramDto,
    });
  };

  public deleteTag = async (paramDto: DeleteTagParamDto): Promise<void> => this.tagRepository.deleteTag({ ...paramDto });
}
