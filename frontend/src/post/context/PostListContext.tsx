import _ from 'lodash';
import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import { PostDto } from '@src/post/dto/PostListResponseDto';
import { TagDto } from '@src/tag/dto/TagResponseDto';
import { CategoryDto } from '@src/category/dto/CategoryResponseDto';
import { SeriesDto } from '@src/series/dto/SeriesResponseDto';

type PostListState = {
  postList: PostDto[];
  selectedCategoryId: string | undefined;
  selectedSeriesId: string | undefined;
  selectedTagIdList: string[];
};

const PostListStateContext = createContext<PostListState>({
  postList: [],
  selectedCategoryId: undefined,
  selectedSeriesId: undefined,
  selectedTagIdList: [],
});

const enum PostListActionType {
  UPDATE_POST_LIST,
  INIT_SEARCH_CONDITIONS,
  UPDATE_SELECTED_CATEGORY_ID,
  UPDATE_SELECTED_SERIES_ID,
  UPDATE_SELECTED_TAG_ID_LIST,
}

type PostListAction =
  { type: PostListActionType.UPDATE_POST_LIST, postList: PostDto[] } |
  {
    type: PostListActionType.INIT_SEARCH_CONDITIONS,
    categoryId?: string,
    seriesId?: string,
    tagIdList?: string[]
  } |
  { type: PostListActionType.UPDATE_SELECTED_CATEGORY_ID, category: CategoryDto } |
  { type: PostListActionType.UPDATE_SELECTED_SERIES_ID, series: SeriesDto } |
  { type: PostListActionType.UPDATE_SELECTED_TAG_ID_LIST, tagList: TagDto[] };

type PostListDispatch = Dispatch<PostListAction>;

const PostListDispatchContext = createContext<PostListDispatch | undefined>(undefined);

const postListReducer = (state: PostListState, action: PostListAction): PostListState => {
  switch (action.type) {
    case PostListActionType.UPDATE_POST_LIST:
      return {
        ...state,
        postList: action.postList,
      };
    case PostListActionType.INIT_SEARCH_CONDITIONS:
      return {
        ...state,
        selectedCategoryId: action.categoryId,
        selectedSeriesId: action.seriesId,
        selectedTagIdList: _.isNil(action.tagIdList) ? [] : action.tagIdList,
      };
    case PostListActionType.UPDATE_SELECTED_CATEGORY_ID:
      return {
        ...state,
        selectedCategoryId: action.category._id,
      };
    case PostListActionType.UPDATE_SELECTED_SERIES_ID:
      return {
        ...state,
        selectedSeriesId: action.series._id,
      };
    case PostListActionType.UPDATE_SELECTED_TAG_ID_LIST:
      return {
        ...state,
        selectedTagIdList: action.tagList.map((tag) => tag._id),
      };
    default:
      throw new Error('Unhandled action'); // TODO: 에러 공통화
  }
};

const PostListContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [postListState, dispatch] = useReducer(postListReducer, {
    postList: [],
    selectedCategoryId: undefined,
    selectedSeriesId: undefined,
    selectedTagIdList: [],
  });

  return (
    <PostListDispatchContext.Provider value={dispatch}>
      <PostListStateContext.Provider value={postListState}>
        {children}
      </PostListStateContext.Provider>
    </PostListDispatchContext.Provider>
  );
};

const usePostListState = (): PostListState => {
  const state = useContext(PostListStateContext);
  if (!state) {
    throw new Error('Internal Error'); // TODO: 에러 공통화
  }
  return state;
};

const usePostListDispatch = (): PostListDispatch => {
  const dispatch = useContext(PostListDispatchContext);
  if (!dispatch) {
    throw new Error('Internal Error'); // TODO: 에러 공통화
  }
  return dispatch;
};

export {
  PostListActionType,
  PostListContextProvider,
  usePostListState,
  usePostListDispatch,
};
