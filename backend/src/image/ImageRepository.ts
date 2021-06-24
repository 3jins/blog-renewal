import _ from 'lodash';
import { Service } from 'typedi';
import Image, { ImageDoc } from '@src/image/Image';
import { ClientSession, CreateQuery } from 'mongoose';
import { transactional, useTransaction } from '@src/common/mongodb/TransactionDecorator';
import BlogError from '@src/common/error/BlogError';
import { BlogErrorCode } from '@src/common/error/BlogErrorCode';

@Service()
export default class ImageRepository {
  // TODO: session을 파라미터로 넣을 방법이 없어졌음.
  //  멤버변수로 넣어서 사용하는 것도 이상하고.. (두 개 이상 트랜잭션 동시에 돌면 꼬일 수 있음)
  //  그리고 지금 transactional은 createImages에 imageList도 못 넣음. method.apply(this, session)만 하고 args가 없기 때문에...
  //  descriptor에 비밀이 있을 것 같은데.. 어쨌든 arguments 넣는 방법 조사하다 보면 뭔가 길이 보이지 않을까?
  @transactional()
  public createImages(imageList: CreateQuery<ImageDoc>[]) {
    return async (session: ClientSession) => {
      await this.validateFileNameDuplication(imageList, session);
      await Image.insertMany(imageList, { session });
    };
  }

  private async validateFileNameDuplication(imageList: CreateQuery<ImageDoc>[], session: ClientSession): Promise<void> {
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
  }
}
