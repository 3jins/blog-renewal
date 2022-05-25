import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import Parser from 'html-react-parser';
import * as URL from '@common/constant/URL';
import Language from '@common/constant/Language';
import { callByGet, callByPost } from '@src/common/http/HttpCaller';
import { PostDto, PostPreviewResponseDto } from '@src/post/dto/PostListResponseDto';
import TagEditor from '@src/tag/admin/component/TagEditor';
import { CreateNewPostRequestDto } from '@src/post/dto/PostRequestDto';
import {
  StagedPostMetaActionType,
  StagedPostMetaDispatch,
  useStagedPostMetaDispatch,
  useStagedPostMetaState,
} from '@src/post/admin/context/StagedPostMetaContext';
import { AdminActionType } from '@src/admin/context/AdminContext';
import CategoryEditor from '@src/category/admin/component/CategoryEditor';
import SeriesEditor from '@src/series/admin/SeriesEditor';
import Loading from '@src/common/component/Loading';
import PostType from '@common/constant/PostType';

export default (props) => {
  const {
    stagedCategory,
    stagedSeries,
    stagedTagList,
    isPrivate,
    isDraft,
  } = useStagedPostMetaState();
  const stagedPostMetaDispatch: StagedPostMetaDispatch = useStagedPostMetaDispatch();

  const { adminDispatch } = props;

  const [post, setPost] = useState<FileList | null>(null);
  const [language, setLanguage] = useState<Language>(Language.KO);
  const [postType, setPostType] = useState<PostType>(PostType.POST);
  const [postPreview, setPostPreview] = useState<PostPreviewResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => fetchPostPreview(), [post]);

  const fetchPostPreview = () => {
    if (_.isNil(post)) {
      return;
    }
    const formData = new FormData();
    formData.append('post', post[0]);
    callByPost(
      `${URL.PREFIX.API}${URL.ENDPOINT['POST-PREVIEW']}`,
      formData,
      { 'Content-Type': 'application/octet-stream' },
    ).then((postPreviewResponse: PostPreviewResponseDto) => {
      setPostPreview(postPreviewResponse);
    });
  };

  const showPreview = () => _.isNil(postPreview)
    ? null
    : (
      <section className="preview">
        <h3>Preview</h3>
        {Parser(postPreview.renderedContent)}
      </section>
    );

  const createPost = async () => {
    if (_.isNil(post)) {
      alert('업로드 된 파일이 없습니다.');
      return;
    }
    const formData = new FormData();
    formData.append('post', post[0]);
    const requestDto: CreateNewPostRequestDto = {
      categoryName: stagedCategory?.name,
      seriesName: stagedSeries?.name,
      tagNameList: stagedTagList
        .filter((tag) => !_.isNil(tag))
        .map((tag) => tag.name),
      language,
    };
    Object.keys(requestDto)
      .filter((key) => !_.isNil(requestDto[key]))
      .forEach((key) => formData.append(key, JSON.stringify(requestDto[key])));
    setIsLoading(true);
    const postNo: number = await callByPost(
      `${URL.PREFIX.API}${URL.ENDPOINT.POST}`,
      formData,
    );
    // TODO: 성공 메세지 토스트
    setPostPreview(null);
    setPost(null);
    stagedPostMetaDispatch({ type: StagedPostMetaActionType.RESET });
    const addedPost: PostDto = await callByGet(`${URL.PREFIX.API}${URL.ENDPOINT.POST}/${postNo}`);
    adminDispatch({ type: AdminActionType.ADD_POST, post: addedPost });
    setIsLoading(false);
  };

  return (
    <section>
      <h2>Create a new post</h2>
      {isLoading
        ? <Loading/>
        : (
          <React.Fragment>
            <input type="file" name="file" onChange={e => setPost(e.target!.files)}/>
            <CategoryEditor stagedPostMetaDispatch={stagedPostMetaDispatch} stagedCategory={stagedCategory}/>
            <SeriesEditor stagedPostMetaDispatch={stagedPostMetaDispatch} stagedSeries={stagedSeries}/>
            <TagEditor stagedPostMetaDispatch={stagedPostMetaDispatch} stagedTagList={stagedTagList}/>
            {showPreview()}
            <button type="button" onClick={() => createPost()}>뚜샤!</button>
          </React.Fragment>
        )}
    </section>
  );
}
