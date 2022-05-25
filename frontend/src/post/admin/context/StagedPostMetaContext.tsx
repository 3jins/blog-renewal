import _ from 'lodash';
import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import { CategoryDto } from '@src/category/dto/CategoryResponseDto';
import { SeriesDto } from '@src/series/dto/SeriesResponseDto';
import { TagDto } from '@src/tag/dto/TagResponseDto';

type StagedPostMetaState = {
  stagedCategory: CategoryDto | null,
  stagedSeries: SeriesDto | null,
  stagedTagList: TagDto[],
  isPrivate: boolean,
  isDraft: boolean,
};

const getDefaultState = () => ({
  stagedCategory: null,
  stagedSeries: null,
  stagedTagList: [],
  isPrivate: false,
  isDraft: false,
});

const StagedPostMetaStateContext = createContext<StagedPostMetaState>(getDefaultState());

const enum StagedPostMetaActionType {
  SET_CATEGORY,
  REMOVE_CATEGORY,
  SET_SERIES,
  REMOVE_SERIES,
  ADD_TAG,
  REMOVE_TAG,
  CHANGE_TO_PRIVATE,
  CHANGE_TO_PUBLIC,
  CHANGE_TO_DRAFT,
  CHANGE_TO_COMPLETED,
  RESET,
}

type StagedPostMetaAction =
  | { type: StagedPostMetaActionType.SET_CATEGORY, category: CategoryDto }
  | { type: StagedPostMetaActionType.REMOVE_CATEGORY, category: CategoryDto }
  | { type: StagedPostMetaActionType.SET_SERIES, series: SeriesDto }
  | { type: StagedPostMetaActionType.REMOVE_SERIES, series: SeriesDto }
  | { type: StagedPostMetaActionType.ADD_TAG, tag: TagDto }
  | { type: StagedPostMetaActionType.REMOVE_TAG, tag: TagDto }
  | { type: StagedPostMetaActionType.CHANGE_TO_PRIVATE }
  | { type: StagedPostMetaActionType.CHANGE_TO_PUBLIC }
  | { type: StagedPostMetaActionType.CHANGE_TO_DRAFT }
  | { type: StagedPostMetaActionType.CHANGE_TO_COMPLETED }
  | { type: StagedPostMetaActionType.RESET };

type StagedPostMetaDispatch = Dispatch<StagedPostMetaAction>;

const StagedPostMetaDispatchContext = createContext<StagedPostMetaDispatch | undefined>(undefined);

const stagedPostMetaReducer = (state: StagedPostMetaState, action: StagedPostMetaAction): StagedPostMetaState => {
  switch (action.type) {
    case StagedPostMetaActionType.SET_CATEGORY:
      return {
        ...state,
        stagedCategory: action.category,
      };
    case StagedPostMetaActionType.REMOVE_CATEGORY:
      return {
        ...state,
        stagedCategory: null,
      };
    case StagedPostMetaActionType.SET_SERIES:
      return {
        ...state,
        stagedSeries: action.series,
      };
    case StagedPostMetaActionType.REMOVE_SERIES:
      return {
        ...state,
        stagedSeries: null,
      };
    case StagedPostMetaActionType.ADD_TAG:
      const { stagedTagList: newTagList } = state;
      newTagList.push(action.tag);
      return {
        ...state,
        stagedTagList: _.uniq(newTagList),
      };
    case StagedPostMetaActionType.REMOVE_TAG:
      return {
        ...state,
        stagedTagList: state.stagedTagList.filter((stagedTag) => stagedTag !== action.tag),
      };
    case StagedPostMetaActionType.CHANGE_TO_PRIVATE:
      return {
        ...state,
        isPrivate: true,
      };
    case StagedPostMetaActionType.CHANGE_TO_PUBLIC:
      return {
        ...state,
        isPrivate: false,
      };
    case StagedPostMetaActionType.CHANGE_TO_DRAFT:
      return {
        ...state,
        isDraft: true,
      };
    case StagedPostMetaActionType.CHANGE_TO_COMPLETED:
      return {
        ...state,
        isDraft: false,
      };
    case StagedPostMetaActionType.RESET:
      return getDefaultState();
    default:
      throw new Error('Unhandled action'); // TODO: 에러 공통화
  }
};

const StagedPostMetaContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [stagedPostMetaState, dispatch] = useReducer(stagedPostMetaReducer, getDefaultState());

  return (
    <StagedPostMetaDispatchContext.Provider value={dispatch}>
      <StagedPostMetaStateContext.Provider value={stagedPostMetaState}>
        {children}
      </StagedPostMetaStateContext.Provider>
    </StagedPostMetaDispatchContext.Provider>
  );
};

const useStagedPostMetaState = (): StagedPostMetaState => {
  const state = useContext(StagedPostMetaStateContext);
  if (!state) {
    throw new Error('Internal Error'); // TODO: 에러 공통화
  }
  return state;
};

const useStagedPostMetaDispatch = (): StagedPostMetaDispatch => {
  const dispatch = useContext(StagedPostMetaDispatchContext);
  if (!dispatch) {
    throw new Error('Internal Error'); // TODO: 에러 공통화
  }
  return dispatch;
}

export {
  StagedPostMetaActionType,
  StagedPostMetaDispatch,
  StagedPostMetaContextProvider,
  useStagedPostMetaState,
  useStagedPostMetaDispatch,
};
