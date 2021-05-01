import Language from '@src/common/constant/Language';
import http2 from 'http2';
import LogLevel from '@src/common/logging/LogLevel';

const root = process.env.PWD;
export const appPath = {
  root,
  testRoot: `${root}/test`,
  testData: `${root}/test/data`,
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
  tag1: {
    name: 'Spring',
    postList: [],
  },
  tag2: {
    name: '우린 시간 앞에 무엇을 선택해야 할까',
    postList: [],
  },
  tag3: {
    name: '넹비ㅓ',
    postList: [],
  },
  series: {
    name: '심슨가족이다, 그지 깽깽이들아!',
    detail: '심슨가족 짤방들에 얽힌 이야기들',
  },
  gifImage: {
    title: 'iu-clap.gif',
    createdDate: new Date('1993-05-16 01:23:45.678'),
    size: 1044310,
  },
  pngImage: {
    title: 'roseblade.png',
    createdDate: new Date('2020-11-28 13:00:31.131'),
    size: 104431,
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
  post3: {
    postNo: 3,
    title: '릴러말즈에 관하여',
    rawContent: '걔가 누군지는 잘 모르겠는데 우시앞무선은 장난 아니게 좋더라',
    renderedContent: '<p>걔가 누군지는 잘 모르겠는데 우시앞무선은 장난 아니게 좋더라</p>',
    language: Language.KO,
    thumbnailContent: '너무 빨리 지나가',
    isLatestVersion: true,
    commentCount: 0,
  },
  postIdList: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439022', '507f1f77bcf86cd799439033'],
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
  objectIdList: ['c0ffee0f0ff1cecafe15900d', 'c0ffee0f0ff1cecafe50900d', 'c0ffee0f0ff1cecafe15baad'],
};

export const blogErrorCode = {
  TEST_FATAL: {
    code: 'TEST_FATAL_CODE',
    errorMessage: common.simpleText,
    loggingMessage: common.simpleText,
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.FATAL,
  },
  TEST_ERROR: {
    code: 'TEST_ERROR_CODE',
    errorMessage: common.simpleText,
    loggingMessage: common.simpleText,
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.ERROR,
  },
  TEST_WARN: {
    code: 'TEST_WARN_CODE',
    errorMessage: common.simpleText,
    loggingMessage: common.simpleText,
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.WARN,
  },
  TEST_INFO: {
    code: 'TEST_INFO_CODE',
    errorMessage: common.simpleText,
    loggingMessage: common.simpleText,
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.INFO,
  },
  TEST_DEBUG: {
    code: 'TEST_DEBUG_CODE',
    errorMessage: common.simpleText,
    loggingMessage: common.simpleText,
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.DEBUG,
  },
  TEST_TRACE: {
    code: 'TEST_TRACE_CODE',
    errorMessage: common.simpleText,
    loggingMessage: common.simpleText,
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.TRACE,
  },
  TEST_MUTE: {
    code: 'TEST_MUTE_CODE',
    errorMessage: common.simpleText,
    loggingMessage: common.simpleText,
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.MUTE,
  },
  TEST_DEFAULT: {
    code: 'TEST_DEFAULT_CODE',
    errorMessage: common.simpleText,
    loggingMessage: common.simpleText,
    httpErrorCode: http2.constants.HTTP_STATUS_BAD_REQUEST,
  },
  TEST_ERROR_WITH_PARAMS: {
    code: 'TEST_PARAMS_CODE',
    errorMessage: common.simpleText,
    loggingMessage: 'Parameters are given: {0}, {1}, and {2}.',
    httpErrorCode: http2.constants.HTTP_STATUS_BAD_REQUEST,
    logLevel: LogLevel.ERROR,
  },
};
