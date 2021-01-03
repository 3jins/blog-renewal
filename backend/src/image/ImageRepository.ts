import _ from 'lodash';
import { Service } from 'typedi';
import Image, { ImageDoc } from '@src/image/Image';
import { ClientSession, CreateQuery } from 'mongoose';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class ImageRepository {
  public createImages = (imageList: CreateQuery<ImageDoc>[]) => useTransaction(async (session: ClientSession) => {
    await this.validateFileNameDuplication(imageList, session);
    await Image.create(imageList, { session });
  });

  private validateFileNameDuplication = async (imageList: CreateQuery<ImageDoc>[], session: ClientSession): Promise<void> => {
    const imageListWithoutDuplication = _.uniq(imageList.map((image) => image.title));
    const isDuplicatedNameExistInImageParams = imageListWithoutDuplication.length !== imageList.length;
    const duplicatedNamedImageList = _.uniq(_.flatten(
      await Promise.all(imageList.map((image) => Image
        .find({ title: image.title })
        .session(session))),
    ));
    if (isDuplicatedNameExistInImageParams || duplicatedNamedImageList.length > 0) {
      const duplicatedNameList = _.uniq(_.flatten(
        duplicatedNamedImageList.map((image) => image.title),
        _.difference(imageList, imageListWithoutDuplication),
      ));
      throw new BlogError(BlogErrorCode.DUPLICATED_FILE_NAME, [duplicatedNameList.join(', ')]);
    }
  };
}
