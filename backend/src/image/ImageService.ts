import fs, { PathLike } from 'fs';
import path from 'path';
import _ from 'lodash';
import { File, Files } from 'formidable';
import config from 'config';
import { Service } from 'typedi';
import { ClientSession, DocumentDefinition } from 'mongoose';
import BlogError from '@src/common/error/BlogError';
import ImageRepository from '@src/image/ImageRepository';
import { ImageDoc } from '@src/image/Image';
import { UploadImageParamDto } from '@src/image/dto/ImageParamDto';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';
import { BlogErrorCode } from '../common/error/BlogErrorCode';

@Service()
export default class ImageService {
  public constructor(private readonly imageRepository: ImageRepository) {
  }

  public async uploadImage(paramDto: UploadImageParamDto): Promise<void> {
    await useTransaction(async (session: ClientSession) => {
      const { files } = paramDto;
      this.moveImage(files);
      await this.saveImage(files, session);
    });
  }

  private moveImage(files: Files): void {
    const newPath: PathLike = `${config.get('path.appData')}${config.get('path.image')}`;
    _.keys(files).forEach((fileName) => {
      const { path: filePath } = files[fileName] as File;
      const newFilePath = path.resolve(newPath.toString(), fileName);
      try {
        fs.renameSync(filePath, newFilePath);
      } catch (err) {
        throw new BlogError(BlogErrorCode.FILE_CANNOT_BE_MOVED, [filePath, newFilePath]);
      }
    });
  }

  private async saveImage(files: Files, session: ClientSession): Promise<void> {
    const imageList: DocumentDefinition<ImageDoc>[] = _.keys(files).map((fileName) => {
      const file: File = files[fileName] as File;
      return ({ title: file.name as string, createdDate: new Date(), size: file.size });
    });
    await this.imageRepository.createImages(imageList, session);
  }
}
