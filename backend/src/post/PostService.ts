import fs from 'fs';
import _ from 'lodash';
import { Service } from 'typedi';
import { Types } from 'mongoose';
import PostMetaRepository from '@src/post/repository/PostMetaRepository';
import PostRepository from '@src/post/repository/PostRepository';
import CategoryRepository from '@src/category/CategoryRepository';
import SeriesRepository from '@src/series/SeriesRepository';
import TagRepository from '@src/tag/TagRepository';
import { renderContent } from '@src/common/marked/MarkedContentRenderingUtil';
import { CreatePostMetaRepoParamDto, UpdatePostMetaRepoParamDto } from '@src/post/dto/PostMetaRepoParamDto';
import { AddUpdatedVersionPostParamDto, CreateNewPostParamDto, UpdatePostMetaDataParamDto } from '@src/post/dto/PostParamDto';
import { CreatePostRepoParamDto } from '@src/post/dto/PostRepoParamDto';
import { CategoryDoc } from '@src/category/Category';
import { SeriesDoc } from '@src/series/Series';
import { TagDoc } from '@src/tag/Tag';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { PostMetaDoc } from '@src/post/model/PostMeta';

@Service()
export default class PostService {
  public constructor(
    private readonly postMetaRepository: PostMetaRepository,
    private readonly postRepository: PostRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly seriesRepository: SeriesRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  public async createNewPost(paramDto: CreateNewPostParamDto): Promise<void> {
    const currentDate = new Date();
    const createPostMetaRepoParamDto: CreatePostMetaRepoParamDto = await this.makeCreatePostMetaRepoParamDto(paramDto, currentDate);
    const postNo = await this.postMetaRepository.createPostMeta(createPostMetaRepoParamDto);
    const createPostRepoParamDto: CreatePostRepoParamDto = this.makeCreatePostRepoParamDtoForFirstVersionPost(postNo, paramDto, currentDate);
    await this.postRepository.createPost(createPostRepoParamDto);
  }

  public async addUpdatedVersionPost(paramDto: AddUpdatedVersionPostParamDto): Promise<void> {
    const repoParamDto: CreatePostRepoParamDto = await this.makeCreatePostRepoParamDto(paramDto);
    await this.postRepository.createPost(repoParamDto);
  }

  public async updatePostMetaData(paramDto: UpdatePostMetaDataParamDto): Promise<void> {
    const repoParamDto: UpdatePostMetaRepoParamDto = await this.makeUpdatePostMetaRepoParamDto(paramDto);
    await this.postMetaRepository.updatePostMeta(repoParamDto);
  }

  private async makeCreatePostMetaRepoParamDto(paramDto: CreateNewPostParamDto, currentDate: Date): Promise<CreatePostMetaRepoParamDto> {
    const createPostMetaRepoParamDto: CreatePostMetaRepoParamDto = {
      createdDate: currentDate,
      isPrivate: _.isNil(paramDto.isPrivate) ? false : paramDto.isPrivate,
      isDraft: _.isNil(paramDto.isDraft) ? false : paramDto.isDraft,
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
      Object.assign(createPostMetaRepoParamDto, { seriesId: seriesList[0]._id });
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
      Object.assign(createPostMetaRepoParamDto, { tagIdList: tagList.map((tag) => tag._id) });
    }
    return createPostMetaRepoParamDto;
  }

  private makeCreatePostRepoParamDtoForFirstVersionPost(postNo: number, paramDto: CreateNewPostParamDto, currentDate: Date): CreatePostRepoParamDto {
    const { post, language, thumbnailContent } = paramDto;
    const rawContent: string = this.readPostContent(post.path);
    const { renderedContent, toc, defaultThumbnailContent } = renderContent(rawContent);
    const createPostRepoParamDto: CreatePostRepoParamDto = {
      postNo,
      title: post.name as string,
      rawContent,
      renderedContent,
      toc,
      language,
      thumbnailContent: _.isNil(thumbnailContent) ? defaultThumbnailContent : thumbnailContent,
      updatedDate: currentDate,
      isLatestVersion: true,
    };
    if (!_.isNil(paramDto.thumbnailImageId)) {
      Object.assign(createPostRepoParamDto, { thumbnailImageId: new Types.ObjectId(paramDto.thumbnailImageId) });
    }
    return createPostRepoParamDto;
  }

  private makeCreatePostRepoParamDto(paramDto: AddUpdatedVersionPostParamDto): CreatePostRepoParamDto {
    const { postNo, post, language, thumbnailContent } = paramDto;
    const rawContent: string = this.readPostContent(post.path);
    const { renderedContent, toc, defaultThumbnailContent } = renderContent(rawContent);
    const createPostRepoParamDto: CreatePostRepoParamDto = {
      postNo,
      title: post.name as string,
      rawContent,
      renderedContent,
      toc,
      language,
      thumbnailContent: _.isNil(thumbnailContent) ? defaultThumbnailContent : thumbnailContent,
      updatedDate: new Date(),
      isLatestVersion: true,
    };
    if (!_.isNil(paramDto.thumbnailImageId)) {
      Object.assign(createPostRepoParamDto, { thumbnailImageId: new Types.ObjectId(paramDto.thumbnailImageId) });
    }
    return createPostRepoParamDto;
  }

  private readPostContent(path: string): string {
    return fs.readFileSync(path).toString();
  }

  private async makeUpdatePostMetaRepoParamDto(paramDto: UpdatePostMetaDataParamDto): Promise<UpdatePostMetaRepoParamDto> {
    const { postNo, categoryName, seriesName, tagNameList, isPrivate, isDeprecated, isDraft } = paramDto;
    const [lastVersionPostMeta]: PostMetaDoc[] = await this.postMetaRepository.findPostMeta({ postNo });
    if (_.isNil(lastVersionPostMeta)) {
      throw new BlogError(BlogErrorCode.POST_NOT_FOUND, [postNo.toString(), 'postNo']);
    }

    const updatePostMetaRepoParamDto: UpdatePostMetaRepoParamDto = {
      postNo,
      isPrivate: _.isNil(isPrivate) ? lastVersionPostMeta.isPrivate : isPrivate,
      isDeprecated: _.isNil(isDeprecated) ? lastVersionPostMeta.isDeprecated : isDeprecated,
      isDraft: _.isNil(isDraft) ? lastVersionPostMeta.isDraft : isDraft,
    };

    if (!_.isNil(categoryName)) {
      const categoryList: CategoryDoc[] = await this.categoryRepository.findCategory({ name: categoryName });
      if (_.isEmpty(categoryList)) {
        throw new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [categoryName, 'name']);
      }
      Object.assign(updatePostMetaRepoParamDto, { categoryId: categoryList[0]._id });
    } else {
      Object.assign(updatePostMetaRepoParamDto, { categoryId: lastVersionPostMeta.category });
    }

    if (!_.isNil(seriesName)) {
      const seriesList: SeriesDoc[] = await this.seriesRepository.findSeries({ name: seriesName });
      if (_.isEmpty(seriesList)) {
        throw new BlogError(BlogErrorCode.SERIES_NOT_FOUND, [seriesName, 'name']);
      }
      Object.assign(updatePostMetaRepoParamDto, { seriesId: seriesList[0]._id });
    } else {
      Object.assign(updatePostMetaRepoParamDto, { seriesId: lastVersionPostMeta.series });
    }

    if (!_.isNil(tagNameList)) {
      const tagList: TagDoc[] = await this.tagRepository.findTag({
        findTagByNameDto: {
          nameList: tagNameList,
          isOnlyExactNameFound: true,
        },
      });
      if (tagList.length !== tagNameList.length) {
        const failedToFindTagNameList = _.difference(tagNameList, tagList.map((tag) => tag.name));
        throw new BlogError(BlogErrorCode.TAGS_NOT_FOUND, ['name', failedToFindTagNameList.join(', ')]);
      }
      Object.assign(updatePostMetaRepoParamDto, { tagIdList: tagList.map((tag) => tag._id) });
    } else {
      Object.assign(updatePostMetaRepoParamDto, { tagIdList: lastVersionPostMeta.tagList });
    }

    return updatePostMetaRepoParamDto;
  }
}
