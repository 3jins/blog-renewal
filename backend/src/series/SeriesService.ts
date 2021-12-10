import _ from 'lodash';
import { Service } from 'typedi';
import { ClientSession, PopulatedDoc, Types } from 'mongoose';
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
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import { CategoryDoc } from '@src/category/Category';
import { CategoryDto } from '@src/category/dto/CategoryResponseDto';
import { ImageDoc } from '@src/image/Image';
import { PostMetaDoc } from '@src/post/model/PostMeta';
import { FindSeriesResponseDto, SeriesDto } from '@src/series/dto/SeriesResponseDto';

@Service()
export default class SeriesService {
  public constructor(private readonly seriesRepository: SeriesRepository) {
  }

  public async findSeries(paramDto: FindSeriesParamDto): Promise<FindSeriesResponseDto> {
    return useTransaction(async (session: ClientSession) => {
      const seriesDocList: SeriesDoc[] = await this.seriesRepository
        .findSeries({ ...paramDto }, session);
      return this.convertToFindSeriesResponseDto(seriesDocList);
    });
  }

  public async createSeries(paramDto: CreateSeriesParamDto): Promise<string> {
    return useTransaction(async (session: ClientSession) => {
      const { postMetaIdList } = paramDto;
      const postMetaList: Types.ObjectId[] = _.isNil(postMetaIdList)
        ? []
        : postMetaIdList!.map((postMetaId) => new Types.ObjectId(postMetaId));
      await this.seriesRepository.createSeries({
        postMetaList,
        ...paramDto,
      }, session);

      const seriesList: SeriesDoc[] = await this.seriesRepository.findSeries({ name: paramDto.name }, session);
      if (_.isEmpty(seriesList)) {
        throw new BlogError(BlogErrorCode.CATEGORY_NOT_CREATED, [paramDto.name, 'name']);
      }
      return seriesList[0].name;
    });
  }

  public async updateSeries(paramDto: UpdateSeriesParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      if (_.isNil(paramDto.seriesToBe) || _.isEmpty(_.values(paramDto.seriesToBe))) {
        throw new BlogError(BlogErrorCode.PARAMETER_EMPTY);
      }
      return this.seriesRepository.updateSeries(this.makeUpdateSeriesRepoParamDto(paramDto), session);
    });
  }

  public async deleteSeries(paramDto: DeleteSeriesParamDto): Promise<void> {
    return useTransaction(async (session: ClientSession) => this.seriesRepository
      .deleteSeries({ ...paramDto }, session));
  }

  private convertToFindSeriesResponseDto(seriesDocList: SeriesDoc[]): FindSeriesResponseDto {
    const seriesDtoList: SeriesDto[] = seriesDocList.map((seriesDoc: SeriesDoc) => {
      const { name, thumbnailContent, thumbnailImage, postMetaList } = seriesDoc;
      const seriesDto: SeriesDto = { name, thumbnailContent, postList: postMetaList };
      if (!_.isNil(thumbnailImage)) {
        Object.assign(seriesDto, { thumbnailImage });
      }
      return seriesDto;
    });
    return { seriesList: seriesDtoList };
  }

  private makeUpdateSeriesRepoParamDto(paramDto: UpdateSeriesParamDto): UpdateSeriesRepoParamDto {
    const { originalName, seriesToBe } = paramDto;
    const { postMetaIdToBeAddedList, postMetaIdToBeRemovedList } = seriesToBe;

    _.isNil({});
    return {
      originalName,
      seriesToBe: {
        ...seriesToBe,
        postMetaIdToBeAddedList: _.isNil(postMetaIdToBeAddedList) ? [] : postMetaIdToBeAddedList!,
        postMetaIdToBeRemovedList: _.isNil(postMetaIdToBeRemovedList) ? [] : postMetaIdToBeRemovedList!,
      },
    };
  }
}
