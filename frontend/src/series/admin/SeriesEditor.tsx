import _ from 'lodash';
import React, { useState } from 'react';
import { SeriesDto, SeriesResponseDto } from '@src/series/dto/SeriesResponseDto';
import { callByGet, callByPost } from '@src/common/http/HttpCaller';
import * as URL from '@common/constant/URL';
import { CreateSeriesRequestDto, FindSeriesRequestDto } from '@src/series/dto/SeriesRequestDto';
import AutoCompletionDropBox from '@src/common/component/AutoCompletionDropBox';
import { StagedPostMetaActionType } from '@src/post/admin/context/StagedPostMetaContext';

export default (props) => {
  const { stagedPostMetaDispatch, stagedSeries } = props;
  const [searchSeriesNameText, setSearchSeriesNameText] = useState<string | undefined>(undefined);
  const [fetchedSeriesList, setFetchedSeriesList] = useState<SeriesDto[]>([]);

  const searchSeries = async (searchKeyword: string) => {
    if (_.isEmpty(searchKeyword)) {
      setFetchedSeriesList([]);
      return;
    }
    const requestDto: FindSeriesRequestDto = {
      isOnlyExactNameFound: false, // TODO: Add checkbox later..
    };
    const seriesResponse: SeriesResponseDto = await callByGet(
      `${URL.PREFIX.API}${URL.ENDPOINT.SERIES}/${searchKeyword}`,
      requestDto,
    );
    console.log(seriesResponse);
    setFetchedSeriesList(seriesResponse.seriesList);
  };

  const createSeries = (requestDto: CreateSeriesRequestDto) => callByPost(
    `${URL.PREFIX.API}${URL.ENDPOINT.SERIES}`,
    requestDto,
  );

  const renderSeries = () => _.isNil(stagedSeries) ? null : (
    <span className="tag-style-card">
      <summary>
        {stagedSeries.name}
        <button
          type="button"
          onClick={() => stagedPostMetaDispatch({
            type: StagedPostMetaActionType.REMOVE_SERIES,
            series: stagedSeries,
          })}
        />
        <details>
          <section>
            <h5>thumbnail image:</h5>
            <img
              src={_.isNil(stagedSeries.thumbnailImage) ? '/asset/default.jpg' : stagedSeries.thumbnailImage}
              alt={`thumbnail image for series ${stagedSeries.name}`}
            />
          </section>
          <section>
            <h5>thumbnail content:</h5>
            <p>{stagedSeries.thumbnailContent}</p>
          </section>
          <section>
            <h5>post list:</h5>
            <ul>
              {stagedSeries.postList.map((post) => <li>{post.title}</li>)}
            </ul>
          </section>
        </details>
      </summary>
    </span>
  );

  const isSeriesAlreadyExist = (searchSeriesNameText: string) => fetchedSeriesList
    .map((fetchedSeries) => fetchedSeries.name)
    .includes(searchSeriesNameText);

  return (
    <section>
      <h3>Series</h3>
      <input type="text" name="seriesName" onChange={(e) => {
        setSearchSeriesNameText(e.target.value);
        searchSeries(e.target.value);
      }}/>
      <section>
        <AutoCompletionDropBox
          itemList={fetchedSeriesList.map((fetchedSeries) => ({
            value: fetchedSeries.name,
            actionParameter: { series: fetchedSeries },
          }))}
          dispatch={stagedPostMetaDispatch}
          dispatchType={StagedPostMetaActionType.SET_SERIES}
        />
        {_.isNil(searchSeriesNameText) || isSeriesAlreadyExist(searchSeriesNameText)
          ? null
          : <button
            type="button"
            onClick={() => createSeries({ name: searchSeriesNameText, thumbnailContent: '일단 아무말' })}
          >
            Create series: <b>{searchSeriesNameText}</b>
          </button>}
      </section>
      {renderSeries()}
    </section>
  );
};
