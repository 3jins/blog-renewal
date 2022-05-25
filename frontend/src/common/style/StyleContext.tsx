import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import facepaint, { DynamicStyleFunction } from 'facepaint';
import { Theme } from '@src/common/style/theme/Theme';
import ForestTheme from '@src/common/style/theme/ForestTheme';
import StarryDownTheme from '@src/common/style/theme/StarryDownTheme';

type StyleState = {
  theme: Theme;
  mediaQueryList: DynamicStyleFunction;
};

const defaultStyleState: StyleState = {
  theme: ForestTheme,
  mediaQueryList: facepaint(
    [768, 992, 1200].map((pixel) => `@media (min-width: ${pixel}px)`),
  ),
};

const StyleStateContext = createContext<StyleState>(defaultStyleState);

const enum StyleActionType {
  USE_FOREST_THEME,
  USE_STARRY_DOWN_THEME,
}

type StyleAction =
  { type: StyleActionType.USE_FOREST_THEME } |
  { type: StyleActionType.USE_STARRY_DOWN_THEME };

type StyleDispatch = Dispatch<StyleAction>;

const StyleDispatchContext = createContext<StyleDispatch | undefined>(undefined);

const styleReducer = (state: StyleState, action: StyleAction): StyleState => {
  switch (action.type) {
    case StyleActionType.USE_FOREST_THEME:
      return {
        ...state,
        theme: ForestTheme,
      };
    case StyleActionType.USE_STARRY_DOWN_THEME:
      return {
        ...state,
        theme: StarryDownTheme,
      };
    default:
      throw new Error('Unhandled action'); // TODO: 에러 공통화
  }
};

const StyleContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [styleState, dispatch] = useReducer(styleReducer, defaultStyleState);

  return (
    <StyleDispatchContext.Provider value={dispatch}>
      <StyleStateContext.Provider value={styleState}>
        {children}
      </StyleStateContext.Provider>
    </StyleDispatchContext.Provider>
  );
};

const useStyleState = (): StyleState => {
  const state = useContext(StyleStateContext);
  if (!state) {
    throw new Error('Internal Error'); // TODO: 에러 공통화
  }
  return state;
};

const useStyleDispatch = (): StyleDispatch => {
  const dispatch = useContext(StyleDispatchContext);
  if (!dispatch) {
    throw new Error('Internal Error'); // TODO: 에러 공통화
  }
  return dispatch;
};

export {
  StyleActionType,
  StyleContextProvider,
  useStyleState,
  useStyleDispatch,
};
