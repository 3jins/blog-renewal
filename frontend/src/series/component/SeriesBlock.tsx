import React from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import qs from 'qs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { SeriesDto } from '@src/series/dto/SeriesResponseDto';

interface SeriesProps {
  series: SeriesDto,
  isLinkActivated: boolean,
}

export default (props: SeriesProps) => {
  const { series, isLinkActivated } = props;

  const renderSeries = (series: SeriesDto) => {
    if (_.isNil(series)) {
      return null;
    }

    return (
      <span>
        <FontAwesomeIcon icon={faBook}/>
        {isLinkActivated
          ? (
            <Link to={`/posts?${qs.stringify({ seriesId: series._id })}`}>
              {series.name}
            </Link>
          )
          : (
            <span>
              {series.name}
            </span>
          )}
      </span>
    );
  };

  return renderSeries(series);
}
