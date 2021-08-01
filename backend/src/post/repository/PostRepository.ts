import { Service } from 'typedi';
import { ClientSession } from 'mongoose';
import Post, { PostDoc } from '@src/post/model/Post';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import { CreatePostRepoParamDto } from '@src/post/dto/PostRepoParamDto';

@Service()
export default class PostRepository {
  public createPost(paramDto: CreatePostRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      const { postNo } = paramDto;
      const lastVersionPost: PostDoc | null = await this.getLastVersionPost(session, postNo);
      await Post
        .insertMany([{
          ...paramDto,
          thumbnailImage: paramDto.thumbnailImageId,
          lastVersionPost: lastVersionPost === null ? null : lastVersionPost!._id,
        }], { session });
    });
  }

  private async getLastVersionPost(session: ClientSession, postNo: number): Promise<PostDoc | null> {
    return await Post
      .findOne({ postNo, isLatestVersion: true }, { _id: true })
      .session(session) as PostDoc;
  }
}
