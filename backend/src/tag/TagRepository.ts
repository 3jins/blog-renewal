import { Service } from 'typedi';
import { ClientSession, FilterQuery } from 'mongoose';
import Tag, { TagDoc } from '@src/tag/Tag';
import { transactional, useTransaction } from '@src/common/mongodb/TransactionDecorator';
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
  // TODO: 콜백 형태로 넘기는 건 부자연스러움. 다른 방법도 모색해볼 것. 그리고 리턴타입 안 맞아서 테스트도 실패하는디...;;
  @transactional()
  public findTag(paramDto: FindTagRepoParamDto) {
    return async (session: ClientSession): Promise<TagDoc[]> => {
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
    };
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

      // Get original postList
      const tag: (TagDoc | null) = await Tag
        .findOne({ name: originalName }, { postList: true }, { session })
        .lean();
      if (tag === null) {
        throw new BlogError(BlogErrorCode.TAG_NOT_FOUND, [originalName]);
      }
      const { postList: postListToBe } = tagToBe;
      const postListAsIs = tag.postList.map((post) => post.toString());

      // Update tag
      await Tag
        .updateOne({ name: originalName }, { ...tagToBe }).session(session);

      // Remove the tag from posts
      const postToBeRemovedList = _.difference(postListAsIs, postListToBe);
      await Post
        .updateMany({ _id: { $in: postToBeRemovedList } }, { $pull: { tagList: tag._id } }, { session });

      // Add the tag from posts
      const postToBeAddedList = _.difference(postListToBe, postListAsIs);
      await Post
        .updateMany({ _id: { $in: postToBeAddedList } }, { $push: { tagList: tag._id } }, { session });
    });
  }

  public deleteTag(paramDto: DeleteTagRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      // Get original postList
      const tag: (TagDoc | null) = await Tag
        .findOne(paramDto, { postList: true }, { session }).lean();
      if (tag === null) {
        throw new BlogError(BlogErrorCode.TAG_NOT_FOUND, [paramDto.name]);
      }

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
}
