import { Service } from 'typedi';
import { ClientSession } from 'mongoose';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import PostMeta, { PostMetaDoc } from '@src/post/model/PostMeta';
import { CreatePostMetaRepoParamDto, FindPostMetaRepoParamDto, UpdatePostMetaRepoParamDto } from '@src/post/dto/PostMetaRepoParamDto';
import _ from 'lodash';
import { FilterQuery, UpdateQuery } from 'mongodb';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';

@Service()
export default class PostMetaRepository {
  public async findPostMeta(paramDto: FindPostMetaRepoParamDto): Promise<PostMetaDoc[]> {
    return useTransaction(async (session: ClientSession) => {
      const queryToFindPostMeta: FilterQuery<PostMetaDoc> = this.makeQueryToFindPostMeta(paramDto);
      return PostMeta
        .find(queryToFindPostMeta)
        .populate('category')
        .populate('series')
        .populate('tagList')
        .session(session);
    });
  }

  public async createPostMeta(paramDto: CreatePostMetaRepoParamDto): Promise<number> {
    return useTransaction(async (session: ClientSession) => {
      const postNo: number = await this.getNextPostNo(session);
      await PostMeta
        .insertMany([{
          postNo,
          ...paramDto,
          category: paramDto.categoryId,
          tagList: paramDto.tagIdList,
          series: paramDto.seriesId,
        }], { session });
      return postNo;
    });
  }

  public async updatePostMeta(paramDto: UpdatePostMetaRepoParamDto): Promise<void> {
    await useTransaction((async (session: ClientSession) => {
      const queryToUpdatePostMeta: UpdateQuery<PostMetaDoc> = await this.makeQueryToUpdatePostMeta(session, paramDto);
      await PostMeta
        .updateMany({ postNo: paramDto.postNo }, queryToUpdatePostMeta, { session });
    }));
  }

  private makeQueryToFindPostMeta(paramDto: FindPostMetaRepoParamDto): FilterQuery<PostMetaDoc> {
    const { postNo, categoryId, seriesId, tagIdList, isPrivate, isDeprecated, isDraft } = paramDto;
    const queryToFindPostMeta: FilterQuery<PostMetaDoc> = {};
    if (!_.isNil(postNo)) {
      Object.assign(queryToFindPostMeta, { postNo });
    }
    if (!_.isNil(isPrivate)) {
      Object.assign(queryToFindPostMeta, { isPrivate });
    }
    if (!_.isNil(isDeprecated)) {
      Object.assign(queryToFindPostMeta, { isDeprecated });
    }
    if (!_.isNil(isDraft)) {
      Object.assign(queryToFindPostMeta, { isDraft });
    }
    if (!_.isNil(categoryId)) {
      Object.assign(queryToFindPostMeta, { category: categoryId });
    }
    if (!_.isNil(seriesId)) {
      Object.assign(queryToFindPostMeta, { series: seriesId });
    }
    if (!_.isEmpty(tagIdList)) {
      Object.assign(queryToFindPostMeta, { tagList: { $in: tagIdList } });
    }

    return queryToFindPostMeta;
  }

  private async makeQueryToUpdatePostMeta(session: ClientSession, paramDto: UpdatePostMetaRepoParamDto): Promise<UpdateQuery<PostMetaDoc>> {
    const originalPostMeta: PostMetaDoc | null = await PostMeta
      .findOne({ postNo: paramDto.postNo }, { postNo: false })
      .session(session);
    if (originalPostMeta === null) {
      throw new BlogError(BlogErrorCode.POST_NOT_FOUND, [paramDto.postNo.toString(), 'postNo']);
    }

    const queryToUpdatePostMeta: UpdateQuery<PostMetaDoc> = {};
    if (!_.isNil(paramDto.categoryId)) {
      Object.assign(queryToUpdatePostMeta, { category: paramDto.categoryId });
    }
    if (!_.isNil(paramDto.seriesId)) {
      Object.assign(queryToUpdatePostMeta, { series: paramDto.seriesId });
    }
    if (!_.isNil(paramDto.tagIdList)) {
      Object.assign(queryToUpdatePostMeta, { tagList: paramDto.tagIdList });
    }
    if (!_.isNil(paramDto.isDeleted)) {
      Object.assign(queryToUpdatePostMeta, { isDeleted: paramDto.isDeleted });
    }
    if (!_.isNil(paramDto.commentCount)) {
      Object.assign(queryToUpdatePostMeta, { commentCount: paramDto.commentCount });
    }
    if (!_.isNil(paramDto.isPrivate)) {
      Object.assign(queryToUpdatePostMeta, { isPrivate: paramDto.isPrivate });
    }
    if (!_.isNil(paramDto.isDeprecated)) {
      Object.assign(queryToUpdatePostMeta, { isDeprecated: paramDto.isDeprecated });
    }
    if (!_.isNil(paramDto.isDraft)) {
      Object.assign(queryToUpdatePostMeta, { isDraft: paramDto.isDraft });
    }
    return queryToUpdatePostMeta;
  }

  private async getNextPostNo(session: ClientSession): Promise<number> {
    const lastPostMeta: PostMetaDoc = await PostMeta
      .findOne()
      .sort({ postNo: -1 })
      .session(session) as PostMetaDoc;
    return _.isNil(lastPostMeta) ? 1 : lastPostMeta.postNo + 1;
  }
}
