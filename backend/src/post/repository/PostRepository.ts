import _ from 'lodash';
import { Service } from 'typedi';
import { ClientSession, FilterQuery, Types } from 'mongoose';
import Post, { PostDoc } from '@src/post/model/Post';
import { CreatePostRepoParamDto, FindPostRepoParamDto } from '@src/post/dto/PostRepoParamDto';

@Service()
export default class PostRepository {
  public async findPost(paramDto: FindPostRepoParamDto, session: ClientSession): Promise<PostDoc[]> {
    const queryToFindPost: FilterQuery<PostDoc> = this.makeQueryToFindPost(paramDto);
    return Post
      .find(queryToFindPost)
      .populate('thumbnailImage')
      .session(session)
      .lean();
  }

  public async createPost(paramDto: CreatePostRepoParamDto, session: ClientSession): Promise<string> {
    const { postNo } = paramDto;
    const lastVersionPost: PostDoc | null = await this.getLastVersionPost(session, postNo);
    const insertedPostList: PostDoc[] = await Post
      .insertMany([{
        ...paramDto,
        thumbnailImage: paramDto.thumbnailImageId,
        lastVersionPost: lastVersionPost === null ? null : lastVersionPost!._id,
      }], { session });
    const [insertedPost] = insertedPostList;
    return insertedPost._id;
  }


  private makeQueryToFindPost(paramDto: FindPostRepoParamDto): FilterQuery<PostDoc> {
    const {
      postNo,
      title,
      rawContent,
      renderedContent,
      language,
      thumbnailContent,
      thumbnailImageId,
      findPostByUpdatedDateDto,
      isLatestVersion,
    } = paramDto;
    const isOnlyExactSameFieldFound = _.isNil(paramDto.isOnlyExactSameFieldFound) ? true : paramDto.isOnlyExactSameFieldFound;

    const queryToFindPost: FilterQuery<PostDoc> = {};
    this.setFieldToQuery(queryToFindPost, postNo, 'postNo', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPost, title, 'title', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPost, rawContent, 'rawContent', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPost, renderedContent, 'renderedContent', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPost, language, 'language', true);
    this.setFieldToQuery(queryToFindPost, thumbnailContent, 'thumbnailContent', isOnlyExactSameFieldFound);
    this.setFieldToQuery(queryToFindPost, thumbnailImageId, 'thumbnailImage', true);
    if (!_.isNil(findPostByUpdatedDateDto)) {
      const { from, to } = findPostByUpdatedDateDto;
      Object.assign(queryToFindPost, { updatedDate: this.makeDateQuery(from, to) });
    }
    this.setFieldToQuery(queryToFindPost, isLatestVersion, 'isLatestVersion', true);

    return queryToFindPost;
  }

  private setFieldToQuery(query: FilterQuery<PostDoc>, fieldValue: any, fieldName: string, isOnlyExactSameFieldFound: boolean): void {
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

  private async getLastVersionPost(session: ClientSession, postNo: number): Promise<PostDoc | null> {
    return await Post
      .findOne({ postNo, isLatestVersion: true }, { _id: true })
      .session(session) as PostDoc;
  }
}
