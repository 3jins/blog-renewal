import { Heading } from '@src/post/model/Post';
import { TokensList } from 'marked';

export const makeToc = (tokenList: TokensList): Heading[] => (tokenList
  .filter((token) => token.type === 'heading') as Heading[])
  .map((token) => ({ depth: token.depth, text: token.text }));

export const makeDefaultThumbnailContent = (tokenList: TokensList): string => tokenList
  .filter((token) => token.type === 'paragraph')
  // @ts-ignore
  .map((token) => token.tokens
    .map((nestedToken) => (['br', 'space'].includes(nestedToken.type) ? ' ' : nestedToken.text))
    .join(''))
  .join(' ')
  .slice(0, 300)
  .concat('...');
