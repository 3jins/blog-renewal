import fs from 'fs';
import _ from 'lodash';
import { Service } from 'typedi';
import { ClientSession, Types } from 'mongoose';
import PostMetaRepository from '@src/post/repository/PostMetaRepository';
import PostVersionRepository from '@src/post/repository/PostVersionRepository';
import CategoryRepository from '@src/category/CategoryRepository';
import SeriesRepository from '@src/series/SeriesRepository';
import TagRepository from '@src/tag/TagRepository';
import { renderContent } from '@src/common/marked/MarkedContentRenderingUtil';
import {
  CreatePostMetaRepoParamDto,
  FindPostMetaRepoParamDto,
  UpdatePostMetaRepoParamDto,
} from '@src/post/dto/PostMetaRepoParamDto';
import {
  AddUpdatedVersionPostParamDto,
  CreateNewPostParamDto,
  DeletePostParamDto,
  DeletePostVersionParamDto,
  FindPostParamDto,
  UpdatePostMetaDataParamDto,
} from '@src/post/dto/PostParamDto';
import { CreatePostVersionRepoParamDto, FindPostVersionRepoParamDto } from '@src/post/dto/PostVersionRepoParamDto';
import { CategoryDoc } from '@src/category/Category';
import { SeriesDoc } from '@src/series/Series';
import { TagDoc } from '@src/tag/Tag';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { PostMetaDoc } from '@src/post/model/PostMeta';
import { FindPostResponseDto, PostDto, PostVersionDto } from '@src/post/dto/PostResponseDto';
import { PostVersionDoc } from '@src/post/model/PostVersion';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';

@Service()
export default class PostService {
  public constructor(
    private readonly postMetaRepository: PostMetaRepository,
    private readonly postVersionRepository: PostVersionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly seriesRepository: SeriesRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  public async findPost(paramDto: FindPostParamDto): Promise<FindPostResponseDto> {
    return useTransaction(async (session: ClientSession) => {
      const findPostMetaRepoParamDto: FindPostMetaRepoParamDto = await this.makeFindPostMetaRepoParamDto(paramDto);
      const postMetaList: PostMetaDoc[] = await this.postMetaRepository.findPostMeta(findPostMetaRepoParamDto, session);
      const findPostRepoParamDto: FindPostVersionRepoParamDto = await this.makeFindPostRepoParamDto(paramDto);
      const postVersionList: PostVersionDoc[] = await this.postVersionRepository.findPostVersion(findPostRepoParamDto, session);
      return this.combineFindPostResponse(postMetaList, postVersionList);
    });
  }

  public async createNewPost(paramDto: CreateNewPostParamDto): Promise<number> {
    return useTransaction(async (session: ClientSession) => {
      const currentDate = new Date();
      const createPostMetaRepoParamDto: CreatePostMetaRepoParamDto = await this.makeCreatePostMetaRepoParamDto(paramDto, currentDate, session);
      const postNo = await this.postMetaRepository.createPostMeta(createPostMetaRepoParamDto, session);
      const createPostRepoParamDto: CreatePostVersionRepoParamDto = this.makeCreatePostRepoParamDtoForFirstVersionPost(postNo, paramDto, currentDate);
      await this.postVersionRepository.createPostVersion(createPostRepoParamDto, session);
      return postNo;
    });
  }

  public async addUpdatedVersionPost(paramDto: AddUpdatedVersionPostParamDto): Promise<string> {
    return useTransaction(async (session: ClientSession) => {
      const repoParamDto: CreatePostVersionRepoParamDto = await this.makeCreatePostRepoParamDto(paramDto);
      return this.postVersionRepository.createPostVersion(repoParamDto, session);
    });
  }

  public async updatePostMetaData(paramDto: UpdatePostMetaDataParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      const repoParamDto: UpdatePostMetaRepoParamDto = await this.makeUpdatePostMetaRepoParamDto(paramDto, session);
      await this.postMetaRepository.updatePostMeta(repoParamDto, session);
    });
  }

  public async deletePostVersion(paramDto: DeletePostVersionParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => this.postVersionRepository
      .deletePostVersion(paramDto, session));
  }

  public async deletePost(paramDto: DeletePostParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => this.postMetaRepository
      .deletePostMeta(paramDto, session));
  }

  private makeFindPostMetaRepoParamDto(paramDto: FindPostParamDto): FindPostMetaRepoParamDto {
    return { ...paramDto };
  }

  private makeFindPostRepoParamDto(paramDto: FindPostParamDto): FindPostVersionRepoParamDto {
    const { updateDateFrom, updateDateTo } = paramDto;

    if (_.isNil(updateDateFrom) && _.isNil(updateDateTo)) {
      return { ...paramDto };
    }
    return {
      ...paramDto,
      findPostVersionByUpdatedDateDto: {
        from: updateDateFrom,
        to: updateDateTo,
      },
    };
  }

  private combineFindPostResponse(postMetaList: PostMetaDoc[], postVersionList: PostVersionDoc[]): FindPostResponseDto {
    const postDtoList: PostDto[] = postMetaList
      .map((postMeta) => {
        const postVersionDataDtoList: PostVersionDto[] = postVersionList
          .filter((postVersion) => postVersion.postNo === postMeta.postNo)
          .map((postVersion) => postVersion as PostVersionDto);
        return { ...postMeta, postVersionList: postVersionDataDtoList } as PostDto;
      });
    return { postList: postDtoList };
  }

  private async makeCreatePostMetaRepoParamDto(
    paramDto: CreateNewPostParamDto,
    currentDate: Date,
    session: ClientSession,
  ): Promise<CreatePostMetaRepoParamDto> {
    const createPostMetaRepoParamDto: CreatePostMetaRepoParamDto = {
      createdDate: currentDate,
      isPrivate: _.isNil(paramDto.isPrivate) ? false : paramDto.isPrivate,
      isDraft: _.isNil(paramDto.isDraft) ? false : paramDto.isDraft,
    };
    if (!_.isNil(paramDto.categoryName)) {
      const categoryList: CategoryDoc[] = await this.categoryRepository.findCategory({ name: paramDto.categoryName }, session);
      if (_.isEmpty(categoryList)) {
        throw new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [paramDto.categoryName, 'name']);
      }
      Object.assign(createPostMetaRepoParamDto, { categoryId: categoryList[0]._id });
    }
    if (!_.isNil(paramDto.seriesName)) {
      const seriesList: SeriesDoc[] = await this.seriesRepository.findSeries({ name: paramDto.seriesName }, session);
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
      }, session);
      if (tagList.length !== paramDto.tagNameList.length) {
        const failedToFindTagNameList = _.difference(paramDto.tagNameList, tagList.map((tag) => tag.name));
        throw new BlogError(BlogErrorCode.TAG_NOT_FOUND, ['name', failedToFindTagNameList.join(', ')]);
      }
      Object.assign(createPostMetaRepoParamDto, { tagIdList: tagList.map((tag) => tag._id) });
    }
    return createPostMetaRepoParamDto;
  }

  private makeCreatePostRepoParamDtoForFirstVersionPost(postNo: number, paramDto: CreateNewPostParamDto, currentDate: Date): CreatePostVersionRepoParamDto {
    const { post, language, thumbnailContent } = paramDto;
    const rawContent: string = this.readPostContent(post.path);
    const { renderedContent, toc, defaultThumbnailContent } = renderContent(rawContent);
    const createPostRepoParamDto: CreatePostVersionRepoParamDto = {
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

  private makeCreatePostRepoParamDto(paramDto: AddUpdatedVersionPostParamDto): CreatePostVersionRepoParamDto {
    const { postNo, post, language, thumbnailContent } = paramDto;
    const rawContent: string = this.readPostContent(post.path);
    const { renderedContent, toc, defaultThumbnailContent } = renderContent(rawContent);
    const createPostRepoParamDto: CreatePostVersionRepoParamDto = {
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

  private async makeUpdatePostMetaRepoParamDto(paramDto: UpdatePostMetaDataParamDto, session: ClientSession): Promise<UpdatePostMetaRepoParamDto> {
    const { postNo, categoryName, seriesName, tagNameList, isPrivate, isDeprecated, isDraft } = paramDto;
    const [lastVersionPostMeta]: PostMetaDoc[] = await this.postMetaRepository.findPostMeta({ postNo }, session);
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
      const categoryList: CategoryDoc[] = await this.categoryRepository.findCategory({ name: categoryName }, session);
      if (_.isEmpty(categoryList)) {
        throw new BlogError(BlogErrorCode.CATEGORY_NOT_FOUND, [categoryName, 'name']);
      }
      Object.assign(updatePostMetaRepoParamDto, { categoryId: categoryList[0]._id });
    } else {
      Object.assign(updatePostMetaRepoParamDto, { categoryId: lastVersionPostMeta.category });
    }

    if (!_.isNil(seriesName)) {
      const seriesList: SeriesDoc[] = await this.seriesRepository.findSeries({ name: seriesName }, session);
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
      }, session);
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
