import _ from 'lodash';
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { config } from '@src/common/config/ConfigUtil';
import { handleError } from '@src/common/http/HttpResponseErrorHandler';

const { url, port } = config.get('server');

const callRestApi = async (axiosCallback: Function) => {
  try {
    const response: AxiosResponse = await axiosCallback();
    // TODO: status, header 등에 대한 공통 처리 필요 (axios wrapper) ... 에러처리는 catch 및 팝업 또는 리다이렉션
    if (_.isNil(response)) {
      handleError();
    }
    return response.data;
  } catch (error) {
    console.error(error);
    handleError();
  }
};

const callByGet = async (apiUrl: string, queryObject?: object, headers?: AxiosRequestHeaders) => callRestApi(
  () => axios.get(
    `${url}:${port}${apiUrl}`,
    {
      params: _.isNil(queryObject) ? {} : queryObject,
      headers: _.isNil(headers) ? { 'Content-Type': 'application/json' } : headers,
      paramsSerializer: (queryObject: object) => {
        if (_.isNil(queryObject)) {
          return '';
        }
        const params = new URLSearchParams();
        const queryObjectWithoutNilFields = _.omitBy(queryObject, _.isNil);
        _.forIn(queryObjectWithoutNilFields, (value, key) => {
          if (Array.isArray(value)) {
            value.forEach((element) => {
              params.append(key, element.toString());
            });
          } else {
            params.append(key, value.toString());
          }
        })
        console.log(`callByGet: ${JSON.stringify(params.toString())}`);
        return params.toString();
      },
    },
  ),
);

const callByPost = async (apiUrl: string, body: object, headers?: AxiosRequestHeaders) => callRestApi(
  () => axios.post(
    `${url}:${port}${apiUrl}`,
    body,
    {
      headers: _.isNil(headers) ? { 'Content-Type': 'application/json' } : headers,
    },
  ),
);

const callByPatch = async (apiUrl: string, body: object, headers?: AxiosRequestHeaders) => callRestApi(
  () => axios.patch(
    `${url}:${port}${apiUrl}`,
    body,
    {
      headers: _.isNil(headers) ? { 'Content-Type': 'application/json' } : headers,
    },
  ),
);

const callByDelete = async (apiUrl: string, targetIdentifier: string, headers?: AxiosRequestHeaders) => callRestApi(
  () => axios.delete(
    `${url}:${port}${apiUrl}/${targetIdentifier}`,
    {
      headers: _.isNil(headers) ? { 'Content-Type': 'application/json' } : headers,
    },
  ),
);

export { callByGet, callByPost, callByPatch, callByDelete };
