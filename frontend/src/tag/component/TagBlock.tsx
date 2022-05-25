import React from 'react';
import { Link } from 'react-router-dom';
import qs from 'qs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag } from '@fortawesome/free-solid-svg-icons';
import { TagDto } from '@src/tag/dto/TagResponseDto';

interface TagListProps {
  tagList: TagDto[],
  isLinkActivated: boolean,
}

export default (props: TagListProps) => {
  const { tagList, isLinkActivated } = props;

  const renderTagList = (tagList: TagDto[]) => (
    <span>
      <FontAwesomeIcon icon={faTag}/>
      {tagList.map((tag) => isLinkActivated
        ? (
          <Link
            key={tag._id}
            to={`/posts?${qs.stringify({ tagIdList: [tag._id] })}`}
          >
            {tag.name}
          </Link>
        )
        : (
          <span key={tag._id}>
            {tag.name}
          </span>
        ))}
    </span>
  );

  return renderTagList(tagList);
}
