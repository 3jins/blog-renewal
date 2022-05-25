import React from 'react';
import { SyncLoader } from 'react-spinners';
import { useStyleState } from '@src/common/style/StyleContext';

export default () => {
  const { theme } = useStyleState();
  const {
    supportingTheme2,
  } = theme;

  return (
    <div className="loading">
      <SyncLoader color={supportingTheme2}/>
    </div>
  );
}
