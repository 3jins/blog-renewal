import _ from 'lodash';
import { Service } from 'typedi';
import { ClientSession, FilterQuery } from 'mongoose';
import PostVersion, { PostVersionDoc } from '@src/post/model/PostVersion';
import { CreatePostVersionRepoParamDto, DeletePostVersionRepoParamDto, FindPostVersionRepoParamDto } from '@src/post/dto/PostVersionRepoParamDto';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';

@Service()
export default class PostVersionRepository {
  public async findPostVersion(paramDto: FindPostVersionRepoParamDto, session: ClientSession): Promise<PostVersionDoc[]> {
    const queryToFindPostVersion: FilterQuery<PostVersionDoc> = this.makeQueryToFindPostVersion(paramDto);
    return PostVersion
      .find(queryToFindPostVersion)
      .populate('thumbnailImage')
      .session(session)
      .lean();
  }

  public async createPostVersion(paramDto: CreatePostVersionRepoParamDto, session: ClientSession): Promise<string> {
    const { postNo } = paramDto;
    const lastPostVersion: PostVersionDoc | null = await this.getLastPostVersion(session, postNo);
    const insertedPostVersionList: PostVersionDoc[] = await PostVersion
      .insertMany([{
        ...paramDto,
        thumbnailImage: paramDto.thumbnailImageId,
        lastPostVersion: lastPostVersion === null ? null : lastPostVersion!._id,
      }], { session });
    const [insertedPostVersion] = insertedPostVersionList;
    return insertedPostVersion._id;
  }

  public async deletePostVersion(paramDto: DeletePostVersionRepoParamDto, session: ClientSession): Promise<void> {
    const { postVersionId } = paramDto;
    const target: PostVersionDoc | null = await PostVersion
      .findById(postVersionId)
      .session(session);
    if (target === null) {
      throw new BlogError(BlogErrorCode.POST_NOT_FOUND, [postVersionId, 'postVersionId']);
    }
    await PostVersion
      .deleteOne({ _id: postVersionId })
      .session(session);
  }

  private makeQueryToFindPostVersion(paramDto: FindPostVersionRepoParamDto): FilterQuery<PostVersionDoc> {
    const {
      postNo,
      postVersionId,
      title,
      rawContent,
      renderedContent,
      language,
      thumbnailContent,
      thumbnailImageId,
      findPostVersionByUpdatedDateDto,
      isLatestVersion,
    } = paramDto;
    const isOnlyExactSameFieldFound = _.isNil(paramDto.isOnlyExactSameFieldFound) ? true : paramDto.isOnlyExactSameFieldFound;

    const queryToFindPostVersion: FilterQuery<PostVersionDoc> = {};
    this.setFieldToQuery(queryToFindPostVersion, postVersionId, '_id', true);
    this.setFieldToQuery(queryToFindPostVersion, postNo, 'postNo', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPostVersion, title, 'title', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPostVersion, rawContent, 'rawContent', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPostVersion, renderedContent, 'renderedContent', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPostVersion, language, 'language', true);
    this.setFieldToQuery(queryToFindPostVersion, thumbnailContent, 'thumbnailContent', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPostVersion, thumbnailImageId, 'thumbnailImage', true);
    if (!_.isNil(findPostVersionByUpdatedDateDto)) {
      const { from, to } = findPostVersionByUpdatedDateDto;
      Object.assign(queryToFindPostVersion, { updatedDate: this.makeDateQuery(from, to) });
    }
    this.setFieldToQuery(queryToFindPostVersion, isLatestVersion, 'isLatestVersion', true);

    return queryToFindPostVersion;
  }

  private setFieldToQuery(query: FilterQuery<PostVersionDoc>, fieldValue: any, fieldName: string, isOnlyExactSameFieldFound: boolean): void {
    const objectToBeAssigned: object = {};
    objectToBeAssigned[fieldName] = isOnlyExactSameFieldFound
      ? fieldValue
      : { $regex: fieldValue, $options: 'i' };
    if (!_.isNil(fieldValue)) {
      Object.assign(query, objectToBeAssigned);
    }
  }

  private makeDateQuery(from: Date | undefined, to: Date | undefined): FilterQuery<Date> {
    const dateQuery: FilterQuery<Date> = {};
    if (!_.isNil(from)) {
      Object.assign(dateQuery, { $gte: from });
    }
    if (!_.isNil(to)) {
      Object.assign(dateQuery, { $lte: to });
    }
    return dateQuery;
  }

  private async getLastPostVersion(session: ClientSession, postNo: number): Promise<PostVersionDoc | null> {
    return await PostVersion
      .findOne({ postNo, isLatestVersion: true }, { _id: true })
      .session(session) as PostVersionDoc;
  }
}
