import { Service } from 'typedi';
import { ClientSession } from 'mongoose';
import Post, { PostDoc } from '@src/post/Post';
import { useTransaction } from '@src/common/mongodb/TransactionDecorator';
import { CreatePostRepoParamDto } from '@src/post/PostDto';
import _ from 'lodash';

@Service()
export default class PostRepository {
  public createPost(paramDto: CreatePostRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      const postNo = await this.getNextPostNo(session);
      await Post
        .insertMany([{
          ...paramDto,
          postNo,
          category: paramDto.categoryId,
          tagList: paramDto.tagIdList,
          series: paramDto.seriesId,
          thumbnailImage: paramDto.thumbnailImageId,
        }], { session });
    });
  }

  public addPostVersion(paramDto: CreatePostRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      const { title } = paramDto;
      const {
        _id: lastVersionPostId,
        postNo,
        commentCount,
      } = await this.getLatestVersionPost(session, title);
      await Post
        .insertMany([{
          ...paramDto,
          postNo,
          lastVersionPost: lastVersionPostId,
          commentCount,
        }], { session });
      await Post
        .updateOne({ _id: lastVersionPostId }, { isLatestVersion: false }, { session });
    });
  }

  private async getNextPostNo(session: ClientSession): Promise<number> {
    const lastPost: PostDoc = await Post
      .findOne()
      .sort({ postNo: -1 })
      .session(session) as PostDoc;
    return _.isEmpty(lastPost) ? 1 : lastPost.postNo + 1;
  }

  private async getLatestVersionPost(session: ClientSession, title: string): Promise<PostDoc> {
    return await Post
      .findOne({ title, isLatestVersion: true })
      .session(session) as PostDoc;
  }
}
