import http2 from 'http2';
import LogLevel from '../logging/LogLevel';

interface BlogErrorCodeFormat {
  code: string,
  errorMessage: string,
  loggingMessage: string,
  httpErrorCode: number,
  logLevel: LogLevel,
}

const BlogErrorCode: { [key: string]: BlogErrorCodeFormat } = {
  UNEXPECTED_ERROR: {
    code: 'UNEXPECTED_ERROR',
    errorMessage: '예상치 못한 에러가 발생했습니다.',
    loggingMessage: '예상치 못한 에러가 발생했습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.ERROR,
  },
  INVALID_REQUEST_PARAMETER: {
    code: 'INVALID_REQUEST_PARAMETER',
    errorMessage: '형식에 맞지 않는 요청 파라미터가 시스템에 인입되었습니다.',
    loggingMessage: '형식에 맞지 않는 요청 파라미터({0})가 시스템에 인입되었습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_BAD_REQUEST,
    logLevel: LogLevel.WARN,
  },
  FILE_NOT_UPLOADED: {
    code: 'FILE_NOT_UPLOADED',
    errorMessage: '파일이 업로드되지 않았습니다.',
    loggingMessage: '파일({0})이 업로드되지 않았습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_BAD_REQUEST,
    logLevel: LogLevel.ERROR,
  },
  FILE_CANNOT_BE_MOVED: {
    code: 'FILE_CANNOT_BE_MOVED',
    errorMessage: '파일을 이동시키는데 실패했습니다.',
    loggingMessage: '파일을 이동시키는데 실패했습니다. ({0} -> {1})',
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.ERROR,
  },
  TRANSACTION_FAILED: {
    code: 'TRANSACTION_FAILED',
    errorMessage: '트랜잭션 처리 중 예외가 발생하여 롤백했습니다.',
    loggingMessage: '트랜잭션 처리 중 예외가 발생하여 롤백했습니다. (예외내용: {0})',
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.ERROR,
  },
  DUPLICATED_FILE_NAME: {
    code: 'DUPLICATED_FILE_NAME',
    errorMessage: '중복된 파일명이 있습니다.',
    loggingMessage: '중복된 파일명이 있습니다. (중복된 파일 리스트: {0})',
    httpErrorCode: http2.constants.HTTP_STATUS_BAD_REQUEST,
    logLevel: LogLevel.WARN,
  },
  PARAMETER_EMPTY: {
    code: 'PARAMETER_EMPTY',
    errorMessage: '필요한 파라미터가 비어있습니다.',
    loggingMessage: '필요한 파라미터가 비어있습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_BAD_REQUEST,
    logLevel: LogLevel.WARN,
  },
  TAG_NOT_FOUND: {
    code: 'TAG_NOT_FOUND',
    errorMessage: '존재하는 tag가 아닙니다.',
    loggingMessage: '{1}:{0} 정보로는 tag를 찾을 수 없습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_NOT_FOUND,
    logLevel: LogLevel.WARN,
  },
  TAGS_NOT_FOUND: {
    code: 'TAGS_NOT_FOUND',
    errorMessage: '존재하는 tag가 아닙니다.',
    loggingMessage: '주어진 {0} 정보로는 tag를 찾을 수 없습니다. (찾지 못한 tag 리스트: {1})',
    httpErrorCode: http2.constants.HTTP_STATUS_NOT_FOUND,
    logLevel: LogLevel.WARN,
  },
  TAG_NOT_CREATED: {
    code: 'TAG_NOT_CREATED',
    errorMessage: 'tag가 생성되지 않았습니다.',
    loggingMessage: 'tag({1}:{0})가 생성되지 않았습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.WARN,
  },
  CATEGORY_NOT_FOUND: {
    code: 'CATEGORY_NOT_FOUND',
    errorMessage: '존재하는 category가 아닙니다.',
    loggingMessage: '{1}:{0} 정보로는 category를 찾을 수 없습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_NOT_FOUND,
    logLevel: LogLevel.WARN,
  },
  CATEGORY_NOT_CREATED: {
    code: 'CATEGORY_NOT_CREATED',
    errorMessage: 'category가 생성되지 않았습니다.',
    loggingMessage: 'category({1}:{0})가 생성되지 않았습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.WARN,
  },
  CATEGORY_WITH_CHILDREN_CANNOT_BE_DELETED: {
    code: 'CATEGORY_WITH_CHILDREN_CANNOT_BE_DELETED',
    errorMessage: '하위 카테고리가 있어 삭제가 불가능합니다.',
    loggingMessage: '하위 카테고리가 있어 삭제가 불가능합니다. (하위 카테고리 리스트: {0})',
    httpErrorCode: http2.constants.HTTP_STATUS_NOT_FOUND,
    logLevel: LogLevel.WARN,
  },
  ALREADY_BELONG_TO_ANOTHER_SERIES: {
    code: 'ALREADY_BELONG_TO_ANOTHER_SERIES',
    errorMessage: '이미 다른 시리즈에 포함된 게시물이 있습니다.',
    loggingMessage: '이미 다른 시리즈에 포함된 게시물이 있습니다. (postNo: {0}, seriesName: {1})',
    httpErrorCode: http2.constants.HTTP_STATUS_NOT_FOUND,
    logLevel: LogLevel.WARN,
  },
  SERIES_NOT_FOUND: {
    code: 'SERIES_NOT_FOUND',
    errorMessage: '존재하는 series가 아닙니다.',
    loggingMessage: '{1}:{0} 정보로는 series를 찾을 수 없습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_NOT_FOUND,
    logLevel: LogLevel.WARN,
  },
  SERIES_NOT_CREATED: {
    code: 'SERIES_NOT_CREATED',
    errorMessage: 'series가 생성되지 않았습니다.',
    loggingMessage: 'series({1}:{0})가 생성되지 않았습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.WARN,
  },
  POST_NOT_FOUND: {
    code: 'POST_NOT_FOUND',
    errorMessage: 'post를 찾을 수 없습니다.',
    loggingMessage: '{1}:{0} 정보로는 post를 찾을 수 없습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_NOT_FOUND,
    logLevel: LogLevel.WARN,
  },
  POST_NOT_CREATED: {
    code: 'POST_NOT_CREATED',
    errorMessage: 'post가 생성되지 않았습니다.',
    loggingMessage: 'post({1}:{0})가 생성되지 않았습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR,
    logLevel: LogLevel.WARN,
  },
};

export { BlogErrorCodeFormat, BlogErrorCode };
