import LogLevel from '@src/common/logging/LogLevel';

interface BlogErrorFormat {
  blogErrorCode: string,
  errorMessage: string,
  httpErrorCode: number,
  logLevel: LogLevel,
}

export default BlogErrorFormat;
