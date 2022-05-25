import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { DynamicStyle } from 'facepaint';
import { css, Global } from '@emotion/react';
import { SerializedStyles } from '@emotion/serialize';
import { config } from '@src/common/config/ConfigUtil';
import BlogFrame from '@src/common/component/BlogFrame';
import Main from '@src/main/component/Main';
import PostList from '@src/post/component/PostList';
import Admin from '@src/admin/component/Admin';
import { useStyleState } from '@src/common/style/StyleContext';
import { AdminContextProvider } from '@src/admin/context/AdminContext';
import { PostListContextProvider } from '@src/post/context/PostListContext';
import PostDetail from '@src/post/component/PostDetail';
import UnderConstruction from '@src/common/component/UnderConstruction';

export default () => {
  const { blogTitle, blogDescription } = config.get('meta');

  const makeStyles = (): (SerializedStyles | DynamicStyle)[] => {
    const { theme, mediaQueryList } = useStyleState();
    const {
      backgroundTheme1,
      highlightTheme1,
      highlightTheme2,
      highlightTheme3,
      textTheme,
    } = theme;

    return [
      css`
        * {
          html, body {
            margin: 0;
            padding: 0;
            background-color: ${backgroundTheme1};
            color: ${textTheme};
            overflow-x: hidden;
          }
          a:visited {
            color: ${highlightTheme3};
          }
          a:link {
            color: ${highlightTheme1};
          }
          a:hover {
            color: ${highlightTheme2};
          }
        }
      `,
      ...mediaQueryList({
        body: {
          margin: ['0 2rem', '0 3rem', '0 6rem', '0 10rem'],
        },
      }),
    ];
  };

  return (
    <React.Fragment>
      <Global styles={makeStyles()}/>
      <Helmet>
        <title>{blogTitle}</title>
        <meta
          name="description"
          content={blogDescription}
        />
      </Helmet>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<BlogFrame
              content={Main}
            />}
          />
          <Route
            path="/posts"
            element={<PostListContextProvider
              children={<BlogFrame
                content={PostList}
              />}
            />}
          />
          <Route
            path="/post/:postNo"
            element={<BlogFrame
              content={PostDetail}
            />}
          />
          <Route
            path="/notice"
            element={<UnderConstruction />}
          />
          <Route
            path="/visitors"
            element={<UnderConstruction />}
          />
          <Route
            path="/admin"
            element={<AdminContextProvider
              children={<Admin/>}
            />}
          />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
};
