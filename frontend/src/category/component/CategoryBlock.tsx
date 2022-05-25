import React from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import qs from 'qs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';
import { CategoryDto } from '@src/category/dto/CategoryResponseDto';

interface CategoryProps {
  category: CategoryDto,
  isLinkActivated: boolean,
}

export default (props: CategoryProps) => {
  const { category, isLinkActivated } = props;

  const renderCategory = (category: CategoryDto) => {
    if (_.isNil(category)) {
      return null;
    }

    return (
      <span>
        <FontAwesomeIcon icon={faFolderTree}/>
        {isLinkActivated
          ? (
            <Link to={`/posts?${qs.stringify({ categoryId: category._id })}`}>
              {category.name}
            </Link>
          )
          : (
            <span>
              {category.name}
            </span>
          )}
      </span>
    );
  };

  return renderCategory(category);
}
