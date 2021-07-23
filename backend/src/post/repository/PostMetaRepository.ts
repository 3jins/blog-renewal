import { Service } from 'typedi';
import { ClientSession } from 'mongoose';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import PostMeta, { PostMetaDoc } from '@src/post/model/PostMeta';
import { CreatePostMetaRepoParamDto } from '@src/post/dto/PostMetaRepoParamDto';
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
    const lastPostMeta: PostMetaDoc = await PostMeta
      .findOne()
      .sort({ postNo: -1 })
      .session(session) as PostMetaDoc;
    return _.isNil(lastPostMeta) ? 1 : lastPostMeta.postNo + 1;
  }
}
