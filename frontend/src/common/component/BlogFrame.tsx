import React, { ReactNode, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import qs from 'qs';
import Navigation from '@src/navigation/component/Navigation';

export interface BlogFrameComponentProps {
  isLoading: boolean,
  setIsLoading: Function,
}

interface BlogFrameProps {
  content: (props: BlogFrameComponentProps) => ReactNode;
}

export default (props: BlogFrameProps) => {
  const { content } = props;

  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <React.Fragment>
      <Navigation />
      {content({
        ...useParams(),
        ...qs.parse(searchParams.toString()),
        isLoading,
        setIsLoading,
      })}
    </React.Fragment>
  );
}
