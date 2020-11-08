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
  FILE_NOT_UPLOADED: {
    code: 'FILE_NOT_UPLOADED',
    errorMessage: '파일이 업로드되지 않았습니다.',
    loggingMessage: '파일({0})이 업로드되지 않았습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_BAD_REQUEST,
    logLevel: LogLevel.ERROR,
  },
};

export { BlogErrorCodeFormat, BlogErrorCode };
