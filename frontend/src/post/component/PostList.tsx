import _ from 'lodash';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';
import moment from 'moment';
import { css } from '@emotion/react';
import * as URL from '@common/constant/URL';
import { BlogFrameComponentProps } from '@src/common/component/BlogFrame';
import { callByGet } from '@src/common/http/HttpCaller';
import Loading from '@src/common/component/Loading';
import { PostListActionType, usePostListDispatch, usePostListState } from '@src/post/context/PostListContext';
import { FindPostRequestDto } from '@src/post/dto/PostRequestDto';
import { PostDto, PostListResponseDto } from '@src/post/dto/PostListResponseDto';
import { ImageDto } from '@src/image/dto/ImageResponseDto';
import CategoryBlock from '@src/category/component/CategoryBlock';
import SeriesBlock from '@src/series/component/SeriesBlock';
import TagBlock from '@src/tag/component/TagBlock';
import { useStyleState } from '@src/common/style/StyleContext';
import { SerializedStyles } from '@emotion/serialize';
import { DynamicStyle } from 'facepaint';

interface PostListProps extends BlogFrameComponentProps {
  categoryId?: string,
  seriesId?: string,
  tagIdList?: string[],
}

export default (props: PostListProps) => {
  const {
    categoryId,
    seriesId,
    tagIdList,
    isLoading,
    setIsLoading,
  } = props;

  const {
    postList,
    selectedCategoryId,
    selectedSeriesId,
    selectedTagIdList,
  } = usePostListState();
  const postListDispatch = usePostListDispatch();

  useEffect(() => init(categoryId, seriesId, tagIdList), []);
  useEffect(() => {
    setIsLoading(true);
    fetchPostList({
      isDeleted: false,
      categoryId: selectedCategoryId,
      seriesId: selectedSeriesId,
      tagIdList: selectedTagIdList,
    });
  }, [selectedCategoryId, selectedSeriesId, selectedTagIdList]);

  const init = (categoryId?: string, seriesId?: string, tagIdList?: string[]) => {
    postListDispatch({
      type: PostListActionType.INIT_SEARCH_CONDITIONS,
      categoryId,
      seriesId,
      tagIdList,
    });
  };

  const makeStyles = (): (SerializedStyles | DynamicStyle)[] => {
    const { theme } = useStyleState();
    const {
      textTheme,
    } = theme;

    return [css`
      a {
        color: ${textTheme};
        text-decoration: none;
      }

      article:hover {
        background-color: #cccccc;
      }
    `];
  };

  const fetchPostList = (requestDto: FindPostRequestDto) => {
    if (!isLoading) {
      return;
    }
    callByGet(
      `${URL.PREFIX.API}${URL.ENDPOINT.POST}`,
      requestDto,
    ).then((postResponseDto: PostListResponseDto) => {
      postListDispatch({
        type: PostListActionType.UPDATE_POST_LIST,
        postList: postResponseDto.postList,
      });
      setIsLoading(false);
    });
  };

  const renderImage = (image: ImageDto | undefined) => {
    if (_.isNil(image)) {
      return null;
    }
    return <img src={image.uri} alt="thumbnail image"/>;
  };

  const render = (postList: PostDto[]) => isLoading
    ? <Loading/>
    : <div css={makeStyles()}>
      {postList.map((post) => {
        const [lastPostVersion] = post.postVersionList
          .filter((postVersion) => postVersion.isLatestVersion);
        return (
          <Link key={post.postNo} to={`/post/${post.postNo}`}>
            <article css={makeStyles()}>
              <h2>{lastPostVersion.title}</h2>
              <section>
                {/* TODO: moment 사용 유틸화 - 언어설정에 따라 다른 포맷으로. 당연 UTC는 접근한 클라이언트 기준. */}
                <span>
                created at <time>{moment(post.createdDate).format('lll')}</time>
              </span>
                <span>
                last modified at <time>{moment(lastPostVersion.updatedDate).format('lll')}</time>
              </span>
                <CategoryBlock
                  category={post.category}
                  isLinkActivated={false}
                />
                <SeriesBlock
                  series={post.series}
                  isLinkActivated={false}
                />
                <TagBlock
                  tagList={post.tagList}
                  isLinkActivated={false}
                />
              </section>
              <section className="post-preview-body">
                {renderImage(lastPostVersion.thumbnailImage)}
                <p>{parse(lastPostVersion.thumbnailContent)}</p>
              </section>
            </article>
          </Link>
        );
      })}
    </div>;

  return (
    <React.Fragment>
      {render(postList)}
    </React.Fragment>
  );
};
