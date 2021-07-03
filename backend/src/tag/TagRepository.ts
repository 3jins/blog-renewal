import { Service } from 'typedi';
import { ClientSession, FilterQuery } from 'mongoose';
import Tag, { TagDoc } from '@src/tag/Tag';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import {
  CreateTagRepoParamDto,
  DeleteTagRepoParamDto,
  FindTagByNameDto,
  FindTagByPostIdDto,
  FindTagRepoParamDto,
  UpdateTagRepoParamDto,
} from '@src/tag/dto/TagRepoParamDto';
import _ from 'lodash';
import Post, { PostDoc } from '@src/post/Post';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class TagRepository {
  public findTag(paramDto: FindTagRepoParamDto): Promise<TagDoc[]> {
    return useTransaction(async (session: ClientSession) => {
      const {
        findTagByNameDto,
        findTagByPostIdDto,
      }: FindTagRepoParamDto = paramDto;
      const queryToFindTagByName: FilterQuery<TagDoc> = this.makeQueryToFindTagByName(findTagByNameDto);

      const tagList = await Tag
        .find({ ...queryToFindTagByName })
        .populate('postList')
        .session(session)
        .lean();

      return this.filterTagByPostId(tagList, findTagByPostIdDto);
    });
  }

  public createTag(paramDto: CreateTagRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      // Create tag list
      const tagList: TagDoc[] = await Tag
        .insertMany([paramDto], { session });

      // Update post list
      await Post
        .updateMany({
          _id: { $in: paramDto.postList },
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
      const { postIdToBeAddedList, postIdToBeRemovedList } = tagToBe;
      const { _id: tagId }: TagDoc = await this.getTagByName(session, originalName);

      // Update tag
      await Tag
        .bulkWrite([{
          updateOne: {
            filter: { _id: tagId },
            update: { ...tagToBe, $push: { postList: { $each: postIdToBeAddedList } } },
          },
        }, {
          updateOne: {
            filter: { _id: tagId },
            update: { $pullAll: { postList: postIdToBeRemovedList } },
          },
        }], { session });

      // Update the tag field from posts
      await Post
        .updateMany({ _id: { $in: postIdToBeRemovedList } }, { $pull: { tagList: tagId } }, { session });
      await Post
        .updateMany({ _id: { $in: postIdToBeAddedList } }, { $push: { tagList: tagId } }, { session });
    });
  }

  public deleteTag(paramDto: DeleteTagRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      const tag: TagDoc = await this.getTagByName(session, paramDto.name);

      // Delete tag
      await Tag
        .deleteOne(paramDto, { session });

      // Remove the tag from posts
      await Post
        .updateMany({ _id: { $in: tag.postList } }, { $pull: { tagList: tag._id } }, { session });
    });
  }

  private makeQueryToFindTagByName(paramDto: FindTagByNameDto | undefined): FilterQuery<TagDoc> {
    if (_.isEmpty(paramDto)) {
      return {};
    }
    const { name, isOnlyExactNameFound } = paramDto!;
    return { name: isOnlyExactNameFound ? name : new RegExp(paramDto!.name, 'i') };
  }

  private filterTagByPostId(tagList: FilterQuery<TagDoc>, paramDto: FindTagByPostIdDto | undefined): TagDoc[] {
    if (_.isEmpty(paramDto)) {
      return tagList.map((tag) => tag);
    }
    const { postIdList, isAndCondition } = paramDto!;

    return tagList
      .filter((tag) => (isAndCondition
        ? postIdList
          .map((postId) => (tag.postList as PostDoc[])
            .reduce((result, post) => result || postId === post._id.toString(), false)) // 조회한 postList들 중 _id가 사용자입력값인 postId와 일치하는 건이 있음.
          .reduce((globalResult, localResult) => globalResult && localResult) // 모든 사용자 입력값에 대해 그러해야 함.
        : postIdList
          .reduce((globalResult, postId) => globalResult || (tag.postList as PostDoc[])
            .reduce((result, post) => result || postId === post._id.toString(), false), false)));
  }

  private async getTagByName(session: ClientSession, name: string): Promise<TagDoc> {
    const tag: (TagDoc | null) = await Tag
      .findOne({ name }, { _id: true, postList: true }, { session });
    if (_.isEmpty(tag)) {
      throw new BlogError(BlogErrorCode.TAG_NOT_FOUND, [name, 'name']);
    }
    return tag!;
  }
}
