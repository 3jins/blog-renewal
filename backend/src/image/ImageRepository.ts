import { Service } from 'typedi';
import Image, { ImageDoc } from '@src/image/Image';
import { CreateQuery } from 'mongoose';
import { useTransaction } from '@src/common/mongodb/TransactionUtil';

@Service()
export default class ImageRepository {
  public createImages = (imageList: CreateQuery<ImageDoc>[]) => useTransaction((session) => Image.create(imageList, { session }));
}
