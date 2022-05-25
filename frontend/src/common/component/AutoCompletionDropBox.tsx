import React from 'react';

export type AutoCompletionDropBoxProps = {
  itemList: {
    value: string,
    actionParameter: object,
  }[],
  dispatch: Function,
  dispatchType: number,
};

export default (props: AutoCompletionDropBoxProps) => {
  const { itemList, dispatch, dispatchType } = props;

  return (
    <ul>
      {itemList.map((item) => (
        <li key={item.value}
            onClick={() => dispatch({
              type: dispatchType,
              ...item.actionParameter,
            })}>
          {item.value}
        </li>
      ))}
    </ul>
  );
}