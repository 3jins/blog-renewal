import Language from '@src/common/constant/Language';
import http2 from 'http2';
import LogLevel from '@src/common/logging/LogLevel';
import { Heading } from '@src/post/model/Post';

const root = process.env.PWD;
export const appPath = {
  root,
  testRoot: `${root}/test`,
  testData: `${root}/test/data`,
  renderedHtml: `${root}/test/data/rendered`,
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
  category1: {
    name: 'software development',
  },
  category2: {
    name: 'web',
    level: 1,
  },
  category3: {
    name: 'backend',
    level: 2,
  },
  category4: {
    name: 'frontend',
    level: 2,
  },
  category5: {
    name: 'mobile',
    level: 1,
  },
  category6: {
    name: 'life',
  },
  category7: {
    name: 'etc',
    level: 0,
  },
  duplicatedCategory: {
    name: 'software development',
    level: 1,
  },
  tag1: {
    name: 'Spring',
    postMetaList: [],
  },
  tag2: {
    name: '우린 시간 앞에 무엇을 선택해야 할까',
    postMetaList: [],
  },
  tag3: {
    name: '넹비ㅓ',
    postMetaList: [],
  },
  series1: {
    name: '심슨가족이다, 그지 깽깽이들아!',
    thumbnailContent: '심슨가족 짤방들에 얽힌 이야기들',
    postMetaList: [],
  },
  series2: {
    name: '네이버 취업기',
    thumbnailContent: '내 워라밸을 망치러 온 나의 구원자',
    postMetaList: [],
  },
  series3: {
    name: '블로그 개편기',
    thumbnailContent: '기술블로그 개편에 진심인 편',
    postMetaList: [],
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
    rawContent: '##온 김에 스프링하기\n왜 우리는 노드만으로 행복할 수 없는가',
    renderedContent: '<h2>온 김에 스프링하기</h2><p>왜 우리는 노드만으로 행복할 수 없는가</p>',
    toc: [{ depth: 2, text: '온 김에 스프링하기' }],
    thumbnailContent: '왜 우리는 우리 자체로 행복할 수 없는가',
    language: Language.KO,
    isLatestVersion: true,
  },
  post1DataToBeUpdated: {
    rawContent: '왜 우리는 노드만으로 행복할 수 없는가?\n트렌드는 어디서 와 어디로 가는 중인가?\n원해 이 모든 걸 하나로 아울러 주는 hack.\n',
    renderedContent: '<p>왜 우리는 노드만으로 행복할 수 없는가?<br/>트렌드는 어디서 와 어디로 가는 중인가?<br/>원해 이 모든 걸 하나로 아울러 주는 hack.<br/></p>',
  },
  post2V1: {
    postNo: 2,
    title: '스프링필드',
    rawContent: '심슨가족 시리즈의 무대가 되는 도시다. Pivotal의 Spring과는 별 관계가 없다.',
    renderedContent: '<p>심슨가족 시리즈의 무대가 되는 도시다. Pivotal의 Spring과는 별 관계가 없다.</p>',
    toc: [] as Heading[],
    thumbnailContent: '심슨의 정리',
    language: Language.KO,
    isLatestVersion: false,
  },
  post2V2: {
    postNo: 2,
    title: '스프링필드',
    rawContent: '심슨가족 시리즈의 무대가 되는 도시다. Pivotal의 Spring과는 별 관계가 없다.',
    renderedContent: '<p>심슨가족 시리즈의 무대가 되는 도시다. Pivotal의 Spring과는 별 관계가 없다.</p>',
    toc: [] as Heading[],
    thumbnailContent: '원에 관한 심슨의 정리',
    language: Language.KO,
    isLatestVersion: true,
  },
  post2EnV1: {
    postNo: 2,
    title: 'Springfield',
    rawContent: 'It\'s the city set for Simpson series. It has little related points with Spring of Pivotal.',
    renderedContent: '<p>It\'s the city set for Simpson series. It has little related points with Spring of Pivotal.</p>',
    toc: [],
    thumbnailContent: 'Simpson\'s rule',
    language: Language.EN,
    isLatestVersion: false,
  },
  post2EnV2: {
    postNo: 2,
    title: 'Springfield',
    rawContent: 'It\'s the city set for Simpson series. It has little relation with Spring of Pivotal.',
    renderedContent: '<p>It\'s the city set for Simpson series. It has little relation points with Spring of Pivotal.</p>',
    toc: [],
    thumbnailContent: 'Simpson\'s rule about circles',
    language: Language.EN,
    isLatestVersion: true,
  },
  post3: {
    postNo: 3,
    title: '릴러말즈에 관하여',
    rawContent: '걔가 누군지는 잘 모르겠는데 우시앞무선은 장난 아니게 좋더라',
    renderedContent: '<p>걔가 누군지는 잘 모르겠는데 우시앞무선은 장난 아니게 좋더라</p>',
    toc: [] as Heading[],
    thumbnailContent: '너무 빨리 지나가',
    language: Language.KO,
    isLatestVersion: true,
  },
  postMetaIdList: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439022', '507f1f77bcf86cd799439033'],

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
  objectIdList: [
    'c0ffee0f0ff1cecafe15900d',
    'c0ffee0f0ff1cecafe50900d',
    'c0ffee0f0ff1cecafe15baad',
    '7a57e0f0ff1cec0ffee50bad',
    '900dc0ffec1ea7e5900dc0de',
  ],
  dateList: [
    new Date('1993-07-13T09:12:34.567+0900'),
    new Date('2019-10-24T19:03:12.345+0900'),
    new Date('2021-07-11T15:25:23.456+0900'),
    new Date('2021-12-02T13:04:12.345+0900'),
    new Date('2021-12-03T06:01:23.456+0900'),
    new Date('2021-12-03T06:02:34.567+0900'),
    new Date('2021-12-03T06:02:45.678+0900'),
  ],
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
