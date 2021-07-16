import { Service } from 'typedi';
import { ClientSession, FilterQuery } from 'mongoose';
import _ from 'lodash';
import Tag, { TagDoc } from '@src/tag/Tag';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import {
  CreateTagRepoParamDto,
  DeleteTagRepoParamDto,
  FindTagByNameDto,
  FindTagByPostMetaIdDto,
  FindTagRepoParamDto,
  UpdateTagRepoParamDto,
} from '@src/tag/dto/TagRepoParamDto';
import PostMeta, { PostMetaDoc } from '@src/post/model/PostMeta';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class TagRepository {
  public findTag(paramDto: FindTagRepoParamDto): Promise<TagDoc[]> {
    return useTransaction(async (session: ClientSession) => {
      const {
        findTagByNameDto,
        findTagByPostMetaIdDto,
      }: FindTagRepoParamDto = paramDto;
      const queryToFindTagByName: FilterQuery<TagDoc> = this.makeQueryToFindTagByName(findTagByNameDto);

      const tagList = await Tag
        .find({ ...queryToFindTagByName })
        .populate('postMetaList')
        .session(session)
        .lean();

      return this.filterTagByPostMetaId(tagList, findTagByPostMetaIdDto);
    });
  }

  public createTag(paramDto: CreateTagRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      // Create tag list
      const tagList: TagDoc[] = await Tag
        .insertMany([paramDto], { session });

      // Update post list
      await PostMeta
        .updateMany({
          _id: { $in: paramDto.postMetaList },
        }, {
          $addToSet: {
            tagList:
              { $each: tagList.map((tag) => tag._id) },
          },
        }, { session });
    });
  }

  public updateTag(paramDto: UpdateTagRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      const { originalName, tagToBe } = paramDto;
      const { postMetaIdToBeAddedList, postMetaIdToBeRemovedList } = tagToBe;
      const { _id: tagId }: TagDoc = await this.getTagByName(session, originalName);

      // Update tag
      await Tag
        .bulkWrite([{
          updateOne: {
            filter: { _id: tagId },
            update: { ...tagToBe, $push: { postMetaList: { $each: postMetaIdToBeAddedList } } },
          },
        }, {
          updateOne: {
            filter: { _id: tagId },
            update: { $pullAll: { postMetaList: postMetaIdToBeRemovedList } },
          },
        }], { session });

      // Update the tag field from posts
      await PostMeta
        .updateMany({ _id: { $in: postMetaIdToBeRemovedList } }, { $pull: { tagList: tagId } }, { session });
      await PostMeta
        .updateMany({ _id: { $in: postMetaIdToBeAddedList } }, { $push: { tagList: tagId } }, { session });
    });
  }

  public deleteTag(paramDto: DeleteTagRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      const tag: TagDoc = await this.getTagByName(session, paramDto.name);

      // Delete tag
      await Tag
        .deleteOne(paramDto, { session });

      // Remove the tag from posts
      await PostMeta
        .updateMany({ _id: { $in: tag.postMetaList } }, { $pull: { tagList: tag._id } }, { session });
    });
  }

  private makeQueryToFindTagByName(paramDto: FindTagByNameDto | undefined): FilterQuery<TagDoc> {
    if (_.isNil(paramDto)) {
      return {};
    }
    const { name, isOnlyExactNameFound } = paramDto!;
    return { name: isOnlyExactNameFound ? name : new RegExp(paramDto!.name, 'i') };
  }

  private filterTagByPostMetaId(tagList: FilterQuery<TagDoc>, paramDto: FindTagByPostMetaIdDto | undefined): TagDoc[] {
    if (_.isNil(paramDto)) {
      return tagList.map((tag) => tag);
    }
    const { postMetaIdList, isAndCondition } = paramDto!;

    return tagList
      .filter((tag) => (isAndCondition
        ? postMetaIdList
          .map((postMetaId) => (tag.postMetaList as PostMetaDoc[])
            // 조회한 postMetaList들 중 _id가 사용자입력값인 postMetaId와 일치하는 건이 있음.
            .reduce((result, postMeta) => result || postMetaId === postMeta._id.toString(), false))
          .reduce((globalResult, localResult) => globalResult && localResult) // 모든 사용자 입력값에 대해 그러해야 함.
        : postMetaIdList
          .reduce((globalResult, postMetaId) => globalResult || (tag.postMetaList as PostMetaDoc[])
            .reduce((result, post) => result || postMetaId === post._id.toString(), false), false)));
  }

  private async getTagByName(session: ClientSession, name: string): Promise<TagDoc> {
    const tag: (TagDoc | null) = await Tag
      .findOne({ name }, { _id: true, postMetaList: true }, { session });
    if (_.isNil(tag)) {
      throw new BlogError(BlogErrorCode.TAG_NOT_FOUND, [name, 'name']);
    }
    return tag!;
  }
}
