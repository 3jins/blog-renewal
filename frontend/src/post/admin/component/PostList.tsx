import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import moment from 'moment';
import * as URL from '@common/constant/URL';
import { PostDto, PostListResponseDto } from '@src/post/dto/PostListResponseDto';
import { callByGet, callByPatch } from '@src/common/http/HttpCaller';
import { FindPostRequestDto } from '@src/post/dto/PostRequestDto';
import { AdminActionType } from '@src/admin/context/AdminContext';
import Loading from '@src/common/component/Loading';

export default (props) => {
  // TODO: 블로그 쪽이랑 똑같은 pagination으로 나오면 됨. 블로그 post 목록 디자인 결정되는거에 따라 pagination 종류나 로직 다르게 가져갈 듯.
  const [isLoading, setIsLoading] = useState(true);
  // const [postList, setPostList] = useState<PostDto[]>([]);
  const { postList, adminDispatch } = props;

  useEffect(() => fetchPost(), [isLoading]);

  const fetchPost = () => {
    if (!isLoading) {
      return;
    }
    const requestDto: FindPostRequestDto = {
      isDeleted: false,
    };
    callByGet(
      `${URL.PREFIX.API}${URL.ENDPOINT.POST}`,
      requestDto,
    ).then((postResponseDto: PostListResponseDto) => {
      adminDispatch({ type: AdminActionType.SET_POST_LIST, postList: postResponseDto.postList });
      setIsLoading(false);
    });
  };

  const makePostDeleted = async (postNo: number) => {
    await callByPatch(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${postNo}`, {
      isDeleted: true,
    });
    setIsLoading(true);
  };

  const render = (postList: PostDto[]) => isLoading
    // TODO: 로딩 화면 공통화 + 스피너 사용
    ? <Loading/>
    : postList.map((post) => {
      const [lastPostVersion] = post.postVersionList
        .filter((postVersion) => postVersion.isLatestVersion);
      // TODO: ResponseDto에 있는 모든 필드 다 보여져야 하고, 수정도 가능해야 함. 이 부분은 생성하는 부분 완성되고 나서 진행.
      return (
        <details key={post.postNo}>
          <summary>
            <h4>{lastPostVersion.title}</h4>
            {/*<img src={lastPostVersion.thumbnailImage} alt="thumbnail image"/>*/}
            <section>
              <h5>thumbnail content:</h5>
              <p>{lastPostVersion.thumbnailContent}</p>
            </section>
            {/* TODO: moment 사용 유틸화 - 언어설정에 따라 다른 포맷으로. 당연 UTC는 접근한 클라이언트 기준. */}
            <span>생성일: <time>{moment(post.createdDate).format('lll')}</time></span>
            <span>마지막 수정일: <time>{moment(lastPostVersion.updatedDate).format('lll')}</time></span>
            <button type="button" onClick={() => makePostDeleted(post.postNo)}>DELETE</button>
          </summary>
          {/* TODO: tag, category, series editor */}
          {parse(lastPostVersion.renderedContent)}
        </details>
      );
    });

  return (
    <React.Fragment>
      <h2>List of the posts</h2>
      {render(postList)}
    </React.Fragment>
  );
};
