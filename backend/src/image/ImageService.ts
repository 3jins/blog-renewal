import fs, { PathLike } from 'fs';
import path from 'path';
import _ from 'lodash';
import { Files } from 'formidable';
import config from 'config';
import { Service } from 'typedi';
import BlogError from '@src/common/error/BlogError';
import ImageRepository from '@src/image/ImageRepository';
import { ImageDoc } from '@src/image/Image';
import { UploadImageParamDto } from './ImageDto';
import { BlogErrorCode } from '../common/error/BlogErrorCode';

@Service()
export default class ImageService {
  public constructor(private readonly imageRepository: ImageRepository) {
  }

  public uploadImage(paramDto: UploadImageParamDto) {
    const { files } = paramDto;
    this.moveImage(files);
    this.saveImage(files);
  }

  private moveImage(files: Files): void {
    const newPath: PathLike = `${config.get('path.appData')}${config.get('path.image')}`;
    _.keys(files).forEach((fileName) => {
      const { path: filePath } = files[fileName];
      const newFilePath = path.resolve(newPath.toString(), fileName);
      try {
        fs.renameSync(filePath, newFilePath);
      } catch (err) {
        throw new BlogError(BlogErrorCode.FILE_CANNOT_BE_MOVED, [filePath, newFilePath]);
      }
    });
  }

  private saveImage(files: Files): void {
    const imageList: ImageDoc[] = _.keys(files).map((fileName) => {
      const file = files[fileName];
      return ({ title: file.name, createdDate: new Date(), size: file.size });
    });
    this.imageRepository.createImages(imageList);
  }
}
