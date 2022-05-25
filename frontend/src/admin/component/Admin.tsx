import React from 'react';
import PostList from '@src/post/admin/component/PostList';
import PostCreator from '@src/post/admin/component/PostCreator';
import { StagedPostMetaContextProvider } from '@src/post/admin/context/StagedPostMetaContext';
import { useAdminDispatch, useAdminState } from '@src/admin/context/AdminContext';

export default () => {
  const { postList } = useAdminState();
  const adminDispatch = useAdminDispatch();

  return (
    <React.Fragment>
      <h1>Admin Page</h1>
      <StagedPostMetaContextProvider children={<PostCreator adminDispatch={adminDispatch}/>}/>
      <PostList postList={postList} adminDispatch={adminDispatch}/>
    </React.Fragment>
  );
}
