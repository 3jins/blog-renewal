import { FindPostRequestDto } from '@src/post/dto/PostRequestDto';
import { FindPostParamDto } from '@src/post/dto/PostParamDto';
import Language from '@common/constant/Language';

export const mapFindPostRequestDtoToFindPostParamDto = (source: FindPostRequestDto): FindPostParamDto => {
  const destination: FindPostParamDto = {};
  Object.keys(source)
    .forEach((key) => {
      const assignObject = {};
      if (key === 'language') {
        assignObject[key] = source[key] as Language;
        Object.assign(destination, assignObject);
      }
      if (['updateDateFrom', 'updateDateTo'].includes(key)) {
        assignObject[key] = new Date(source[key]);
        Object.assign(destination, assignObject);
      }
      assignObject[key] = source[key];
      Object.assign(destination, assignObject);
    });
  return destination;
};
