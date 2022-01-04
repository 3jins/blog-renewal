import { Heading } from '@src/post/model/PostVersion';
import { marked } from 'marked';

export const makeToc = (tokenList: marked.TokensList): Heading[] => (tokenList
  .filter((token) => token.type === 'heading') as Heading[])
  .map((token) => ({ depth: token.depth, text: token.text }));

const _assembleNestedTokens = (nestedTokens: marked.Token[]) => nestedTokens
  // @ts-ignore
  .map((nestedToken) => (['br', 'space'].includes(nestedToken.type) ? ' ' : nestedToken.text))
  .join('');

export const makeDefaultThumbnailContent = (tokenList: marked.TokensList): string => {
  const THUMBNAIL_MAX_LENGTH = 300;
  const defaultThumbnailContent = tokenList
    .filter((token) => token.type === 'paragraph')
    // @ts-ignore
    .map((token) => _assembleNestedTokens(token.tokens))
    .join(' ')
    .slice(0, THUMBNAIL_MAX_LENGTH);
  return defaultThumbnailContent.length === THUMBNAIL_MAX_LENGTH
    ? defaultThumbnailContent.concat('...')
    : defaultThumbnailContent;
};
