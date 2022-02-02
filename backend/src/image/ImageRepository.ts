import _ from 'lodash';
import { Service } from 'typedi';
import Image from '@src/image/Image';
import { ClientSession } from 'mongoose';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';
import { CreateImageRepoParamDto, ImageDto } from '@src/image/dto/ImageRepoParamDto';

@Service()
export default class ImageRepository {
  public async createImages(repoParamDto: CreateImageRepoParamDto, session: ClientSession): Promise<void> {
    const { imageList } = repoParamDto;
    await this.validateFileNameDuplication(imageList, session);
    await Image.insertMany(imageList, { session });
  }

  private async validateFileNameDuplication(imageList: ImageDto[], session: ClientSession): Promise<void> {
    const imageTitleList: string[] = imageList.map((image) => image.title);
    const duplicatedImageTitleList: string[] = imageTitleList
      .filter((title, idx) => _.includes(imageTitleList, title, idx + 1));
    const isDuplicatedNameExistInImageParams = _.uniq(imageTitleList).length !== imageList.length;
    const duplicatedNamedImageList = _.uniq(_.flatten(
      await Promise.all(imageList.map((image) => Image
        .find({ title: image.title })
        .session(session))),
    ));
    if (isDuplicatedNameExistInImageParams || duplicatedNamedImageList.length > 0) {
      const duplicatedNameList = _.uniq(_.flatten([
        duplicatedNamedImageList.map((image) => image.title),
        duplicatedImageTitleList,
      ]));
      throw new BlogError(BlogErrorCode.DUPLICATED_FILE_NAME, [duplicatedNameList.join(', ')]);
    }
  }
}
