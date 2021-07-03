import { Service } from 'typedi';
import { ClientSession, FilterQuery, Types } from 'mongoose';
import Series, { SeriesDoc } from '@src/series/Series';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import {
  CreateSeriesRepoParamDto,
  DeleteSeriesRepoParamDto,
  FindSeriesRepoParamDto,
  UpdateSeriesRepoParamDto,
} from '@src/series/dto/SeriesRepoParamDto';
import _ from 'lodash';
import Post, { PostDoc } from '@src/post/Post';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class SeriesRepository {
  public findSeries(paramDto: FindSeriesRepoParamDto): Promise<SeriesDoc[]> {
    return useTransaction(async (session: ClientSession) => {
      const queryToFindSeriesByName: FilterQuery<SeriesDoc> = this.makeQueryToFindSeriesByName(paramDto);
      return Series
        .find({ ...queryToFindSeriesByName })
        .populate('postList')
        .session(session)
        .lean();
    });
  }

  public async createSeries(paramDto: CreateSeriesRepoParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      const { postList } = paramDto;

      await this.validatePostList(session, postList);

      // Create a series
      const series: SeriesDoc = (await Series
        .insertMany([paramDto], { session }))[0];

      // Update posts
      await Post
        .updateMany({
          _id: { $in: postList },
        }, {
          series: series._id,
        }, { session });
    });
  }

  public async updateSeries(paramDto: UpdateSeriesRepoParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      const { originalName, seriesToBe } = paramDto;
      const { postIdToBeAddedList, postIdToBeRemovedList } = seriesToBe;

      await this.validatePostList(session, postIdToBeAddedList);
      const seriesId: string = await this.getSeriesIdByName(session, originalName);

      // Update series
      await Series
        .bulkWrite([{
          updateOne: {
            filter: { _id: seriesId },
            update: { ...seriesToBe, $push: { postList: { $each: postIdToBeAddedList } } },
          },
        }, {
          updateOne: {
            filter: { _id: seriesId },
            update: { $pullAll: { postList: postIdToBeRemovedList } },
          },
        }], { session });

      // Update the series field from posts
      await Post
        .updateMany({ _id: { $in: postIdToBeRemovedList } }, { series: null }, { session });
      await Post
        .updateMany({ _id: { $in: postIdToBeAddedList } }, { series: seriesId }, { session });
    });
  }

  public async deleteSeries(paramDto: DeleteSeriesRepoParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      const postList: string[] = await this.getSeriesPostListByName(session, paramDto.name);

      // Delete the series
      await Series
        .deleteOne(paramDto, { session });

      // Remove the series from posts
      await Post
        .updateMany({ _id: { $in: postList } }, { series: null }, { session });
    });
  }

  private makeQueryToFindSeriesByName(paramDto: FindSeriesRepoParamDto): FilterQuery<SeriesDoc> {
    if (_.isEmpty(paramDto)) {
      return {};
    }
    const { name, isOnlyExactNameFound } = paramDto!;
    return { name: isOnlyExactNameFound ? name : new RegExp(paramDto.name!, 'i') };
  }

  private async validatePostList(session: ClientSession, postIdList: (Types.ObjectId | string)[]): Promise<void> {
    const postList: PostDoc[] = await Post
      .find({ _id: { $in: postIdList } }, { postNo: true, series: true }, { session });

    if (_.some(postList, (post) => !_.isEmpty(post.series))) {
      const { postNo, series } = _.find(postList, (post) => !_.isEmpty(post.series));
      throw new BlogError(BlogErrorCode.ALREADY_BELONG_TO_ANOTHER_SERIES, [postNo, series.toString()]);
    }
  }

  private async getSeriesIdByName(session: ClientSession, name: string): Promise<string> {
    return (await this.getSeriesByName(session, name, { _id: true }))._id;
  }

  private async getSeriesPostListByName(session: ClientSession, name: string): Promise<string[]> {
    return (await this.getSeriesByName(session, name, { postList: true })).postList;
  }

  private async getSeriesByName(session: ClientSession, name: string, projection: Object): Promise<SeriesDoc> {
    const series: (SeriesDoc | null) = await Series
      .findOne({ name }, projection, { session });
    if (_.isEmpty(series)) {
      throw new BlogError(BlogErrorCode.SERIES_NOT_FOUND, [name, 'name']);
    }
    return series!;
  }
}
