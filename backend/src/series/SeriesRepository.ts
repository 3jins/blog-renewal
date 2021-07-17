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
import PostMeta, { PostMetaDoc } from '@src/post/model/PostMeta';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class SeriesRepository {
  public findSeries(paramDto: FindSeriesRepoParamDto): Promise<SeriesDoc[]> {
    return useTransaction(async (session: ClientSession) => {
      const queryToFindSeriesByName: FilterQuery<SeriesDoc> = this.makeQueryToFindSeriesByName(paramDto);
      return Series
        .find({ ...queryToFindSeriesByName })
        .populate('postMetaList')
        .session(session)
        .lean();
    });
  }

  public async createSeries(paramDto: CreateSeriesRepoParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      const { postMetaList } = paramDto;

      await this.validatePostMetaList(session, postMetaList);

      // Create a series
      const series: SeriesDoc = (await Series
        .insertMany([paramDto], { session }))[0];

      // Update posts
      await PostMeta
        .updateMany({
          _id: { $in: postMetaList },
        }, {
          series: series._id,
        }, { session });
    });
  }

  public async updateSeries(paramDto: UpdateSeriesRepoParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      const { originalName, seriesToBe } = paramDto;
      const { postMetaIdToBeAddedList, postMetaIdToBeRemovedList } = seriesToBe;

      await this.validatePostMetaList(session, postMetaIdToBeAddedList);
      const seriesId: string = await this.getSeriesIdByName(session, originalName);

      // Update series
      await Series
        .bulkWrite([{
          updateOne: {
            filter: { _id: seriesId },
            update: { ...seriesToBe, $push: { postMetaList: { $each: postMetaIdToBeAddedList } } },
          },
        }, {
          updateOne: {
            filter: { _id: seriesId },
            update: { $pullAll: { postMetaList: postMetaIdToBeRemovedList } },
          },
        }], { session });

      // Update the series field from posts
      await PostMeta
        .updateMany({ _id: { $in: postMetaIdToBeRemovedList } }, { series: null }, { session });
      await PostMeta
        .updateMany({ _id: { $in: postMetaIdToBeAddedList } }, { series: seriesId }, { session });
    });
  }

  public async deleteSeries(paramDto: DeleteSeriesRepoParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      const postMetaList: string[] = await this.getSeriespostMetaListByName(session, paramDto.name);

      // Delete the series
      await Series
        .deleteOne(paramDto, { session });

      // Remove the series from posts
      await PostMeta
        .updateMany({ _id: { $in: postMetaList } }, { series: null }, { session });
    });
  }

  private makeQueryToFindSeriesByName(paramDto: FindSeriesRepoParamDto): FilterQuery<SeriesDoc> {
    if (_.isNil(paramDto)) {
      return {};
    }
    const { name, isOnlyExactNameFound } = paramDto!;
    return { name: isOnlyExactNameFound ? name : new RegExp(paramDto.name!, 'i') };
  }

  private async validatePostMetaList(session: ClientSession, postMetaIdList: (Types.ObjectId | string)[]): Promise<void> {
    const postMetaList: PostMetaDoc[] = await PostMeta
      .find({ _id: { $in: postMetaIdList } }, { postNo: true, series: true })
      .populate('series')
      .session(session);

    if (_.some(postMetaList, (postMeta) => !_.isNil(postMeta.series))) {
      const { postNo, series } = _.find(postMetaList, (postMeta) => !_.isNil(postMeta.series)) as PostMetaDoc;
      throw new BlogError(BlogErrorCode.ALREADY_BELONG_TO_ANOTHER_SERIES, [postNo.toString(), series.name]);
    }
  }

  private async getSeriesIdByName(session: ClientSession, name: string): Promise<string> {
    return (await this.getSeriesByName(session, name, { _id: true }))._id;
  }

  private async getSeriespostMetaListByName(session: ClientSession, name: string): Promise<string[]> {
    return (await this.getSeriesByName(session, name, { postMetaList: true })).postMetaList;
  }

  private async getSeriesByName(session: ClientSession, name: string, projection: Object): Promise<SeriesDoc> {
    const series: (SeriesDoc | null) = await Series
      .findOne({ name }, projection, { session });
    if (_.isNil(series)) {
      throw new BlogError(BlogErrorCode.SERIES_NOT_FOUND, [name, 'name']);
    }
    return series!;
  }
}
