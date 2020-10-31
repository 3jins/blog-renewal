import Language from '@src/common/constant/Language';
import * as path from 'path';

export const appPath = {
  root: process.env.PWD,
  testRoot: path.resolve(process.env.PWD!, 'test'),
};

export const common = {
  masterMember: {
    memberNo: 1,
    name: 'Sejin Jeon',
  },
  guestMember1: {
    memberNo: 2,
    name: 'Keanu Reeves',
  },
  guestMember2: {
    memberNo: 3,
    name: 'Yongha Woo',
  },
  parentCategory: {
    categoryNo: 1,
    name: 'Web',
  },
  childCategory: {
    categoryNo: 2,
    name: 'Backend',
    level: 1,
  },
  duplicatedCategory: {
    name: 'Frontend',
    level: 1,
  },
  tag: {
    name: 'Spring',
  },
  series: {
    name: '심슨가족이다, 그지 깽깽이들아!',
    detail: '심슨가족 짤방들에 얽힌 이야기들',
  },
  image: {
    title: '아이유 박수',
    format: 'gif',
  },
  post1: {
    postNo: 1,
    title: '스프링이란 무엇인가',
    rawContent: '왜 우리는 노드만으로 행복할 수 없는가',
    renderedContent: '<p>왜 우리는 노드만으로 행복할 수 없는가</p>',
    language: Language.KO,
    thumbnailContent: '고양이',
    isLatestVersion: true,
    commentCount: 0,
  },
  post1DataToBeUpdatedFirst: {
    rawContent: '왜 우리는 노드만으로 행복할 수 없는가?\n트렌드는 어디서 와 어디로 가는 중인가?\n',
    renderedContent: '<p>왜 우리는 노드만으로 행복할 수 없는가?<br/>트렌드는 어디서 와 어디로 가는 중인가?<br/></p>',
  },
  post1DataToBeUpdatedSecond: {
    rawContent: '왜 우리는 노드만으로 행복할 수 없는가?\n트렌드는 어디서 와 어디로 가는 중인가?\n원해 이 모든 걸 하나로 아울러 주는 hack.\n',
    renderedContent: '<p>왜 우리는 노드만으로 행복할 수 없는가?<br/>트렌드는 어디서 와 어디로 가는 중인가?<br/>원해 이 모든 걸 하나로 아울러 주는 hack.<br/></p>',
  },
  post2: {
    postNo: 2,
    title: '스프링필드',
    rawContent: '심슨가족 시리즈의 무대가 되는 도시다. Pivotal의 Spring과는 별 관계가 없다.',
    renderedContent: '<p>심슨가족 시리즈의 무대가 되는 도시다. Pivotal의 Spring과는 별 관계가 없다.</p>',
    language: Language.KO,
    thumbnailContent: '강아지',
    isLatestVersion: true,
    commentCount: 0,
  },
  post2En: {
    postNo: 2,
    title: 'Springfield',
    rawContent: 'It\'s the city set for Simpson series. It has little related points with Spring of Pivotal.',
    renderedContent: '<p>It\'s the city set for Simpson series. It has little related points with Spring of Pivotal.</p>',
    language: Language.EN,
    thumbnailContent: 'sob',
    isLatestVersion: true,
    commentCount: 0,
  },
  comment1: {
    isCommentAuthor: false,
    content: '오늘 저녁 메뉴 추천해줘요!',
  },
  comment2: {
    isCommentAuthor: false,
    content: '좋은 글이네요! ^^',
  },
  comment3: {
    isCommentAuthor: true,
    content: '교촌 허니콤보 어떠신가요?',
  },
  comment4: {
    isCommentAuthor: false,
    content: '나한테 이래라 저래라 하지 마세요. 난 노랑통닭이 좋아요.',
  },

  simpleText: 'Just quit, 채워진 바둑판처럼 그만 둬',
};
