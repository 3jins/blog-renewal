import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { CategoryDto, CategoryResponseDto } from '@src/category/dto/CategoryResponseDto';
import { callByDelete, callByGet, callByPost } from '@src/common/http/HttpCaller';
import * as URL from '@common/constant/URL';
import {
  CreateCategoryRequestDto,
  FindCategoryRequestDto,
} from '@src/category/dto/CategoryRequestDto';
import { StagedPostMetaActionType } from '@src/post/admin/context/StagedPostMetaContext';
import { SerializedStyles } from '@emotion/serialize';
import { DynamicStyle } from 'facepaint';
import { useStyleState } from '@src/common/style/StyleContext';
import { css } from '@emotion/react';

export default (props) => {
  type CategoryTreeNode = {
    category: CategoryDto,
    isClosed: boolean,
    hasNeverOpen: boolean,
  };

  const { stagedPostMetaDispatch, stagedCategory } = props;
  const [fetchedCategoryList, setFetchedCategoryList] = useState<CategoryTreeNode[]>([]);
  const [categoryNameText, setCategoryNameText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalParentCategoryId, setModalParentCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    searchCategoryList({ level: 0 })
      .then((categoryResponse: CategoryResponseDto) => setFetchedCategoryList(categoryResponse.categoryList
        .map((category) => ({ category, isClosed: true, hasNeverOpen: true }))));
  }, []);

  const makeStyles = (): (SerializedStyles | DynamicStyle)[] => {
    const { theme } = useStyleState();
    const {
      backgroundTheme2,
      supportingTheme1,
      highlightTheme1,
    } = theme;

    return [css`
      ul.category-tree {
        padding-inline-start: 0;
      }

      ul.category-level-0-tree {
        background-color: ${backgroundTheme2};
        border: 1px solid ${supportingTheme1};
      }

      li.category-node {
        display: block;
        padding-left: 1rem;
      }
      
      li.category-node>div {
        display: inline-flex;
      }

      li.selected {
        background: linear-gradient(to bottom, ${highlightTheme1} 0%, ${highlightTheme1} 100%) no-repeat;
        background-size: calc(100%) calc(1rem + 5px);
        background-position: top;
      }
      
      button.add-category-button {
        margin-left: 1rem;
      }

      button.flip-category-button {
        background-color: transparent;
        border: solid ${supportingTheme1};
        border-width: 0 3px 3px 0;
        display: inline-flex;
        padding: 3px;
        margin-right: 1rem;
      }
      button.flip-category-button.closed {
        transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
      }

      button.flip-category-button.open {
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
      }
    `];
  };

  const searchCategoryList = (requestDto: FindCategoryRequestDto): Promise<CategoryResponseDto> => callByGet(
    `${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`,
    requestDto,
  );

  const searchCategory = async (categoryName: string, requestDto?: FindCategoryRequestDto): Promise<CategoryDto> => {
    const categoryResponse: CategoryResponseDto = await callByGet(
      `${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}/${categoryName}`,
      requestDto,
    );
    return categoryResponse.categoryList[0];
  };

  const createCategory = async (requestDto: CreateCategoryRequestDto) => {
    const categoryName: string = await callByPost(
      `${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`,
      requestDto,
    );
    // TODO: Popup toast

    const category: CategoryDto = await searchCategory(categoryName);
    setFetchedCategoryList([
      ...fetchedCategoryList,
      { category, isClosed: true, hasNeverOpen: true },
    ]);
    setCategoryNameText('');
  };

  const deleteCategory = async (name: string) => {
    await callByDelete(`${URL.PREFIX.API}${URL.ENDPOINT.CATEGORY}`, name);
    setFetchedCategoryList(_.remove(fetchedCategoryList, (node) => node.category.name !== name));
  };

  const flipCategory = async (selectedCategory: CategoryTreeNode) => {
    const fetchedCategoryListAfterFlip: CategoryTreeNode[] = fetchedCategoryList
      .map((fetchedCategory) => (fetchedCategory.category._id === selectedCategory.category._id)
        ? { ...selectedCategory, isClosed: !selectedCategory.isClosed, hasNeverOpen: false }
        : fetchedCategory);
    if (selectedCategory.hasNeverOpen) {
      const categoryResponse: CategoryResponseDto = await searchCategoryList({ parentCategoryId: selectedCategory.category._id });
      const newFetchedCategoryList: CategoryTreeNode[] = categoryResponse.categoryList
        .map((category: CategoryDto) => ({ category, isClosed: true, hasNeverOpen: true }));
      setFetchedCategoryList(_.union(fetchedCategoryListAfterFlip, newFetchedCategoryList));
    } else {
      setFetchedCategoryList(fetchedCategoryListAfterFlip);
    }
  };

  const renderAddCategoryModal = (parentCategoryId?: string) => {
    return (
      <div className="modal">
        <input
          type="text"
          name="categoryName"
          onChange={(e) => setCategoryNameText(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            createCategory({ name: categoryNameText, parentCategoryId });
            setIsModalVisible(false);
            setCategoryNameText('');
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            setIsModalVisible(false);
            setCategoryNameText('');
          }}
        >
          Cancel
        </button>
      </div>
    );
  };

  const renderCategoryTree = (level: number = 0, parentCategoryId?: string) => {
    /*
    Depth of category tree is assumed not to be too deep, so it's not optimized at all.
    It can be optimized with `level` parameter if it's needed.
    */
    return (
      <React.Fragment>
        <ul className={`category-tree category-level-${level}-tree`}>
          {fetchedCategoryList
            .filter((fetchedCategory) => fetchedCategory.category.parentCategoryId === parentCategoryId)
            .map((fetchedCategory) => (
              <li
                key={fetchedCategory.category.name}
                className={`category-node${fetchedCategory.category === stagedCategory ? ' selected' : ''}`}
              >
                <button
                  type="button"
                  className={`flip-category-button ${fetchedCategory.isClosed ? 'closed' : 'open'}`}
                  onClick={() => flipCategory(fetchedCategory)}
                />
                <div
                  onClick={() => stagedPostMetaDispatch({
                    type: stagedCategory !== fetchedCategory.category
                      ? StagedPostMetaActionType.SET_CATEGORY
                      : StagedPostMetaActionType.REMOVE_CATEGORY,
                    category: fetchedCategory.category,
                  })}
                >
                  {fetchedCategory.category.name}
                </div>
                {fetchedCategory.isClosed ? null : renderCategoryTree(level + 1, fetchedCategory.category._id)}
              </li>
            ))}
          <button
            type="button"
            className="add-category-button"
            onClick={() => {
              setModalParentCategoryId(parentCategoryId);
              setIsModalVisible(true);
            }}
          >
            {`Add a new category under ${_.isNil(parentCategoryId) 
              ? 'the root' 
              : fetchedCategoryList
                .filter(fetchedCategory => fetchedCategory.category._id === parentCategoryId)[0]
                .category.name}`}
          </button>
        </ul>
      </React.Fragment>
    );
  };

  return (
    <section css={makeStyles()}>
      <h3>Category</h3>
      {renderCategoryTree()}
      <button
        disabled={_.isNil(stagedCategory)}
        onClick={() => alert('미완성이니까 걍 DB 직접 수정하셈 -_-;')}
      >
        Update the selected category
      </button>
      <button
        disabled={_.isNil(stagedCategory)}
        onClick={() => deleteCategory(stagedCategory.name)}
      >
        Delete the selected category
      </button>
      {isModalVisible ? renderAddCategoryModal(modalParentCategoryId) : null}
    </section>
  );
};
