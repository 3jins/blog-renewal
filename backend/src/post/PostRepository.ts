import { Service } from 'typedi';
import { ClientSession } from 'mongoose';
import Post, { PostDoc } from '@src/post/Post';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import { CreatePostRepoParamDto } from '@src/post/PostDto';
import _ from 'lodash';

@Service()
export default class PostRepository {
  public createPost = (paramDto: CreatePostRepoParamDto) => useTransaction(async (session: ClientSession) => {
    const postNo = await this.getNextPostNo(session);
    await Post
      .create([{
        ...paramDto,
        postNo,
        category: paramDto.categoryId,
        tagList: paramDto.tagIdList,
        series: paramDto.seriesId,
        thumbnailImage: paramDto.thumbnailImageId,
      }], { session });
  });

  public addPostVersion = (paramDto: CreatePostRepoParamDto) => useTransaction(async (session: ClientSession) => {
    const { title } = paramDto;
    const { _id: lastVersionPostId, postNo, commentCount } = await this.getLatestVersionPost(session, title);
    await Post
      .create([{
        ...paramDto,
        postNo,
        lastVersionPost: lastVersionPostId,
        commentCount,
      }], { session });
    await Post
      .updateOne({ _id: lastVersionPostId }, { isLatestVersion: false }, { session });
  });

  private getNextPostNo = async (session: ClientSession): Promise<number> => {
    const lastPost: PostDoc = await Post
      .findOne()
      .sort({ sort: -1 })
      .session(session) as PostDoc;
    if (_.isEmpty(lastPost)) {
      return 1;
    }
    return lastPost.postNo;
  };

  private getLatestVersionPost = async (session: ClientSession, title: string): Promise<PostDoc> => await Post
    .findOne({ title, isLatestVersion: true })
    .session(session) as PostDoc;
}
