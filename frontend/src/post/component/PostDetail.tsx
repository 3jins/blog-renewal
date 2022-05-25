import React, { useEffect, useState } from 'react';
import moment from 'moment';
import parse from 'html-react-parser';
import * as URL from '@common/constant/URL';
import { BlogFrameComponentProps } from '@src/common/component/BlogFrame';
import { callByGet } from '@src/common/http/HttpCaller';
import Loading from '@src/common/component/Loading';
import { PostDto, PostVersionDto } from '@src/post/dto/PostListResponseDto';
import CategoryBlock from '@src/category/component/CategoryBlock';
import SeriesBlock from '@src/series/component/SeriesBlock';
import TagBlock from '@src/tag/component/TagBlock';

interface PostDetailProps extends BlogFrameComponentProps {
  postNo?: number,
}

export default (props: PostDetailProps) => {
  const { postNo, isLoading, setIsLoading } = props;

  if (!postNo) {
    throw new Error('There is no postNo'); // TODO: 에러 공통화
  }

  const [post, setPost] = useState({} as PostDto);
  const [lastPostVersion, setLastPostVersion] = useState({} as PostVersionDto);

  useEffect(() => fetchPostDetail(postNo), [isLoading]);

  const fetchPostDetail = (postNo: number) => {
    if (!isLoading) {
      return;
    }
    callByGet(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${postNo}`)
      .then((postResponseDto: PostDto) => {
        setPost(postResponseDto);
        setLastPostVersion(postResponseDto.postVersionList
          .filter((postVersion) => postVersion.isLatestVersion)[0]);
        setIsLoading(false);
      });
  };

  // TODO:
  //  1. Category, Series도 집어넣기
  //  2. CSS 깔끔하게만 대충 꾸며두기
  //  3. 백엔드 테스트 고치기
  //  4. 커밋 / PR
  //  5. 데이터 복구 및 백업파일 생성
  //  6. 서버 띄우기 (w/o admin)
  //  ----------------------------
  //  7. pagination (BE & FE)
  //  8. 멤버
  //  9. 인증
  //  10. admin 완성
  //  11. 이미지 쪽 수정 + admin 기능 추가

  const render = (post: PostDto, lastPostVersion: PostVersionDto) => isLoading
    ? <Loading/>
    : (
      <article>
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
            isLinkActivated={true}
          />
          <SeriesBlock
            series={post.series}
            isLinkActivated={true}
          />
          <TagBlock
            tagList={post.tagList}
            isLinkActivated={true}
          />
        </section>
        <section>
          {parse(lastPostVersion.renderedContent)}
        </section>
      </article>
    );

  return render(post, lastPostVersion);
};
