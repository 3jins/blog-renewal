import { Service } from 'typedi';
import { ClientSession } from 'mongoose';
import Post, { PostDoc } from '@src/post/model/Post';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import { CreatePostRepoParamDto } from '@src/post/dto/PostRepoParamDto';
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
          thumbnailImage: paramDto.thumbnailImageId,
        }], { session });
    });
  }

  private async getNextPostNo(session: ClientSession): Promise<number> {
    const lastPost: PostDoc = await Post
      .findOne()
      .sort({ postNo: -1 })
      .session(session) as PostDoc;
    return _.isNil(lastPost) ? 1 : lastPost.postNo + 1;
  }

  private async getLatestVersionPost(session: ClientSession, title: string): Promise<PostDoc> {
    return await Post
      .findOne({ title, isLatestVersion: true })
      .session(session) as PostDoc;
  }
}
