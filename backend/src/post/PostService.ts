import _ from 'lodash';
import { Service } from 'typedi';
import fs from 'fs';
import { CreatePostParamDto } from '@src/post/dto/PostParamDto';
import PostRepository from '@src/post/repository/PostRepository';
import PostMetaRepository from '@src/post/repository/PostMetaRepository';
import { Types } from 'mongoose';
import { CreatePostRepoParamDto } from '@src/post/dto/PostRepoParamDto';
import { CreatePostMetaRepoParamDto } from '@src/post/dto/PostMetaRepoParamDto';
import CategoryRepository from '@src/category/CategoryRepository';
import SeriesRepository from '@src/series/SeriesRepository';
import TagRepository from '@src/tag/TagRepository';
import { CategoryDoc } from '@src/category/Category';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { SeriesDoc } from '@src/series/Series';
import { TagDoc } from '@src/tag/Tag';

@Service()
export default class PostService {
  public constructor(
    private readonly postRepository: PostRepository,
    private readonly postMetaRepository: PostMetaRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly seriesRepository: SeriesRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  public async createPost(paramDto: CreatePostParamDto): Promise<void> {
    const currentDate = new Date();
    const createPostMetaRepoParamDto: CreatePostMetaRepoParamDto = await this.makeCreatePostMetaRepoParamDto(paramDto, currentDate);
    const postNo = await this.postMetaRepository.createPostMeta(createPostMetaRepoParamDto);
    const createPostRepoParamDto: CreatePostRepoParamDto = this.makeCreatePostRepoParamDto(postNo, paramDto, currentDate);
    await this.postRepository.createPost(createPostRepoParamDto);
  }

  private async makeCreatePostMetaRepoParamDto(paramDto: CreatePostParamDto, currentDate: Date): Promise<CreatePostMetaRepoParamDto> {
    const createPostMetaRepoParamDto: CreatePostMetaRepoParamDto = {
      createdDate: currentDate,
      isPrivate: paramDto.isPrivate,
    };
    if (!_.isNil(paramDto.categoryName)) {
      const categoryList: CategoryDoc[] = await this.categoryRepository.findCategory({ name: paramDto.categoryName });
      if (_.isEmpty(categoryList)) {
        throw new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [paramDto.categoryName, 'name']);
      }
      Object.assign(createPostMetaRepoParamDto, { categoryId: categoryList[0]._id });
    }
    if (!_.isNil(paramDto.seriesName)) {
      const seriesList: SeriesDoc[] = await this.seriesRepository.findSeries({ name: paramDto.seriesName });
      if (_.isEmpty(seriesList)) {
        throw new BlogError(BlogErrorCode.SERIES_NOT_FOUND, [paramDto.seriesName, 'name']);
      }
    }
    if (!_.isNil(paramDto.tagNameList)) {
      const tagList: TagDoc[] = await this.tagRepository.findTag({
        findTagByNameDto: {
          nameList: paramDto.tagNameList,
          isOnlyExactNameFound: true,
        },
      });
      if (tagList.length !== paramDto.tagNameList.length) {
        const failedToFindTagNameList = _.difference(paramDto.tagNameList, tagList.map((tag) => tag.name));
        throw new BlogError(BlogErrorCode.TAG_NOT_FOUND, ['name', failedToFindTagNameList.join(', ')]);
      }
    }
    return createPostMetaRepoParamDto;
  }

  private makeCreatePostRepoParamDto(postNo: number, paramDto: CreatePostParamDto, currentDate: Date): CreatePostRepoParamDto {
    const { post } = paramDto;
    const rawContent: string = this.readPostContent(post.path);
    const renderedContent = this.renderContent(rawContent);
    const createPostRepoParamDto: CreatePostRepoParamDto = {
      postNo,
      title: post.name as string,
      rawContent,
      renderedContent,
      language: paramDto.language,
      thumbnailContent: paramDto.thumbnailContent,
      isLatestVersion: true,
      lastUpdatedDate: currentDate,
    };
    if (!_.isNil(paramDto.thumbnailImageId)) {
      Object.assign(createPostRepoParamDto, { thumbnailImageId: Types.ObjectId(paramDto.thumbnailImageId) });
    }
    return createPostRepoParamDto;
  }

  private readPostContent(path: string): string {
    return fs.readFileSync(path).toString();
  }

  private renderContent(rawContent: string): string {
    // TODO: 렌더링 로직 구현
    return rawContent;
  }
}
