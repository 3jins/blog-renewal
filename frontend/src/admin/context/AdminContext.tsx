import _ from 'lodash';
import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import { PostDto } from '@src/post/dto/PostListResponseDto';

type AdminState = {
  postList: PostDto[];
};

const AdminStateContext = createContext<AdminState>({
  postList: [],
});

const enum AdminActionType {
  ADD_POST,
  DELETE_POST,
  SET_POST_LIST,
}

type AdminAction =
  | { type: AdminActionType.ADD_POST, post: PostDto }
  | { type: AdminActionType.DELETE_POST, post: PostDto }
  | { type: AdminActionType.SET_POST_LIST, postList: PostDto[] };

type AdminDispatch = Dispatch<AdminAction>;

const AdminDispatchContext = createContext<AdminDispatch | undefined>(undefined);

const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case AdminActionType.ADD_POST:
      const { postList: newPostList } = state;
      newPostList.push(action.post);
      return {
        ...state,
        postList: _.uniq(newPostList),
      };
    case AdminActionType.DELETE_POST:
      return {
        ...state,
        postList: state.postList.filter((post) => post !== action.post),
      };
    case AdminActionType.SET_POST_LIST:
      return {
        ...state,
        postList: action.postList,
      };
    default:
      throw new Error('Unhandled action'); // TODO: 에러 공통화
  }
};

const AdminContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminState, dispatch] = useReducer(adminReducer, {
    postList: [],
  });

  return (
    <AdminDispatchContext.Provider value={dispatch}>
      <AdminStateContext.Provider value={adminState}>
        {children}
      </AdminStateContext.Provider>
    </AdminDispatchContext.Provider>
  );
};

const useAdminState = (): AdminState => {
  const state = useContext(AdminStateContext);
  if (!state) {
    throw new Error('Internal Error'); // TODO: 에러 공통화
  }
  return state;
};

const useAdminDispatch = (): AdminDispatch => {
  const dispatch = useContext(AdminDispatchContext);
  if (!dispatch) {
    throw new Error('Internal Error'); // TODO: 에러 공통화
  }
  return dispatch;
};

export {
  AdminActionType,
  AdminContextProvider,
  useAdminState,
  useAdminDispatch,
};
