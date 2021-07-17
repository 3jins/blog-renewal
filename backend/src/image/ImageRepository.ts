import _ from 'lodash';
import { Service } from 'typedi';
import Image, { ImageDoc } from '@src/image/Image';
import { ClientSession, DocumentDefinition } from 'mongoose';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class ImageRepository {
  public async createImages(imageList: DocumentDefinition<ImageDoc>[]): Promise<void> {
    return useTransaction(async (session: ClientSession) => {
      await this.validateFileNameDuplication(imageList, session);
      await Image.insertMany(imageList, { session });
    });
  }

  private async validateFileNameDuplication(imageList: DocumentDefinition<ImageDoc>[], session: ClientSession): Promise<void> {
    const imageTitleList: string[] = imageList.map((image) => image.title);
    const imageTitleListWithoutDuplication: string[] = _.uniq(imageTitleList);
    const isDuplicatedNameExistInImageParams = imageTitleListWithoutDuplication.length !== imageList.length;
    const duplicatedNamedImageList = _.uniq(_.flatten(
      await Promise.all(imageList.map((image) => Image
        .find({ title: image.title })
        .session(session))),
    ));
    if (isDuplicatedNameExistInImageParams || duplicatedNamedImageList.length > 0) {
      const duplicatedNameList = _.uniq(_.flatten([
        duplicatedNamedImageList.map((image) => image.title),
        _.difference(imageTitleList, imageTitleListWithoutDuplication),
      ]));
      throw new BlogError(BlogErrorCode.DUPLICATED_FILE_NAME, [duplicatedNameList.join(', ')]);
    }
  }
}
