import _ from 'lodash';
import { Service } from 'typedi';
import { Types } from 'mongoose';
import {
  CreateSeriesParamDto,
  DeleteSeriesParamDto,
  FindSeriesParamDto,
  UpdateSeriesParamDto,
} from '@src/series/dto/SeriesParamDto';
import { UpdateSeriesRepoParamDto } from '@src/series/dto/SeriesRepoParamDto';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import BlogError from '@src/common/error/BlogError';
import SeriesRepository from '@src/series/SeriesRepository';
import { SeriesDoc } from '@src/series/Series';

@Service()
export default class SeriesService {
  public constructor(private readonly seriesRepository: SeriesRepository) {
  }

  public async findSeries(paramDto: FindSeriesParamDto): Promise<SeriesDoc[]> {
    return this.seriesRepository.findSeries({ ...paramDto });
  }

  public async createSeries(paramDto: CreateSeriesParamDto): Promise<void> {
    const { postIdList } = paramDto;
    const postList: Types.ObjectId[] = _.isNil(postIdList)
      ? []
      : postIdList!.map((postId) => new Types.ObjectId(postId));
    return this.seriesRepository.createSeries({
      postList,
      ...paramDto,
    });
  }

  public async updateSeries(paramDto: UpdateSeriesParamDto): Promise<void> {
    if (_.isNil(paramDto.seriesToBe) || _.isEmpty(_.values(paramDto.seriesToBe))) {
      throw new BlogError(BlogErrorCode.PARAMETER_EMPTY);
    }
    return this.seriesRepository.updateSeries(this.makeUpdateSeriesRepoParamDto(paramDto));
  }

  public async deleteSeries(paramDto: DeleteSeriesParamDto): Promise<void> {
    return this.seriesRepository.deleteSeries({ ...paramDto });
  }

  private makeUpdateSeriesRepoParamDto(paramDto: UpdateSeriesParamDto): UpdateSeriesRepoParamDto {
    const { originalName, seriesToBe } = paramDto;
    const { postIdToBeAddedList, postIdToBeRemovedList } = seriesToBe;

    _.isNil({});
    return {
      originalName,
      seriesToBe: {
        ...seriesToBe,
        postIdToBeAddedList: _.isNil(postIdToBeAddedList) ? [] : postIdToBeAddedList!,
        postIdToBeRemovedList: _.isNil(postIdToBeRemovedList) ? [] : postIdToBeRemovedList!,
      },
    };
  }
}
