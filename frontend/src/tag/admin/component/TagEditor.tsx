import _ from 'lodash';
import React, { useState } from 'react';
import { TagDto, TagResponseDto } from '@src/tag/dto/TagResponseDto';
import { callByGet, callByPost } from '@src/common/http/HttpCaller';
import * as URL from '@common/constant/URL';
import { CreateTagRequestDto, FindTagRequestDto } from '@src/tag/dto/TagRequestDto';
import AutoCompletionDropBox from '@src/common/component/AutoCompletionDropBox';
import { StagedPostMetaActionType } from '@src/post/admin/context/StagedPostMetaContext';

export default (props) => {
  const { stagedPostMetaDispatch, stagedTagList } = props;
  const [searchTagNameText, setSearchTagNameText] = useState<string | undefined>(undefined);
  const [fetchedTagList, setFetchedTagList] = useState<TagDto[]>([]);

  const searchTag = async (searchKeyword: string) => {
    if (_.isEmpty(searchKeyword)) {
      setFetchedTagList([]);
      return;
    }
    const requestDto: FindTagRequestDto = {
      isOnlyExactNameFound: false, // TODO: Add checkbox later..
      isAndCondition: false,
    };
    await callByGet(
      `${URL.PREFIX.API}${URL.ENDPOINT.TAG}/${searchKeyword}`,
      requestDto,
    ).then((tagResponse: TagResponseDto) => setFetchedTagList(tagResponse.tagList));
  };

  const createTag = (requestDto: CreateTagRequestDto) => callByPost(
    `${URL.PREFIX.API}${URL.ENDPOINT.TAG}`,
    requestDto,
  ).then((tagName: string) => {
    // TODO: Popup toast
  });

  const renderTagList = () => (
    <ul className="staged-tag-list">
      {stagedTagList.map((stagedTag: TagDto) => (
        <li key={stagedTag.name}>
          <span className="tag-style-card">
            {stagedTag.name}
            <button
              type="button"
              onClick={() => stagedPostMetaDispatch({
                type: StagedPostMetaActionType.REMOVE_TAG,
                tag: stagedTag,
              })}
            />
          </span>
        </li>
      ))}
    </ul>
  );

  const isTagAlreadyExist = (searchTagNameText: string) => fetchedTagList
    .map((fetchedTag) => fetchedTag.name)
    .includes(searchTagNameText);

  return (
    <section>
      <h3>Tag</h3>
      <input type="text" name="tagName" onChange={(e) => {
        setSearchTagNameText(e.target.value);
        searchTag(e.target.value);
      }}/>
      <section>
        <AutoCompletionDropBox
          itemList={fetchedTagList.map((fetchedTag) => ({
            value: fetchedTag.name,
            actionParameter: { tag: fetchedTag },
          }))}
          dispatch={stagedPostMetaDispatch}
          dispatchType={StagedPostMetaActionType.ADD_TAG}
        />
        {_.isNil(searchTagNameText) || isTagAlreadyExist(searchTagNameText)
          ? null
          : <button
            type="button"
            onClick={() => createTag({ name: searchTagNameText })}
          >
            Create tag: <b>{searchTagNameText}</b>
          </button>}
      </section>
      {renderTagList()}
    </section>
  );
};
