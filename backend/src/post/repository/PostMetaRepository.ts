import { Service } from 'typedi';
import { ClientSession } from 'mongoose';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import PostMeta from '@src/post/model/PostMeta';
import { CreatePostMetaRepoParamDto } from '@src/post/dto/PostMetaRepoParamDto';
import Post, { PostDoc } from '@src/post/model/Post';
import _ from 'lodash';

@Service()
export default class PostRepository {
  public createPostMeta(paramDto: CreatePostMetaRepoParamDto): Promise<number> {
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

  private async getNextPostNo(session: ClientSession): Promise<number> {
    const lastPost: PostDoc = await Post
      .findOne()
      .sort({ postNo: -1 })
      .session(session) as PostDoc;
    return _.isNil(lastPost) ? 1 : lastPost.postNo + 1;
  }
}
