import { Service } from 'typedi';
import { ClientSession } from 'mongoose';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import PostMeta from '@src/post/model/PostMeta';
import { CreatePostMetaRepoParamDto } from '@src/post/dto/PostMetaRepoParamDto';

@Service()
export default class PostRepository {
  public createPostMeta(paramDto: CreatePostMetaRepoParamDto) {
    return useTransaction(async (session: ClientSession) => {
      await PostMeta
        .insertMany([{
          ...paramDto,
          category: paramDto.categoryId,
          tagList: paramDto.tagIdList,
          series: paramDto.seriesId,
        }], { session });
    });
  }
}
