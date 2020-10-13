import http2 from 'http2';
import LogLevel from '../logging/LogLevel';

const BlogError = { // 테스트 필요. key랑 code가 모두 일치하는지 확인.
  FILE_NOT_UPLOADED: {
    code: 'FILE_NOT_UPLOADED',
    errorMessage: '파일이 업로드되지 않았습니다.',
    httpErrorCode: http2.constants.HTTP_STATUS_BAD_REQUEST,
    logLevel: LogLevel.ERROR,
  },
};

export {
  BlogError,
};
