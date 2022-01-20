import { connectToDb, startApp } from '@src/app';
import CategoryRouter from '@src/category/CategoryRouter';
import HomeRouter from '@src/home/HomeRouter';
import ImageRouter from '@src/image/ImageRouter';
import PostRouter from '@src/post/PostRouter';
import PostPreviewRouter from '@src/post/PostPreviewRouter';
import TagRouter from '@src/tag/TagRouter';

connectToDb();
startApp([
  CategoryRouter,
  HomeRouter,
  ImageRouter,
  PostRouter,
  PostPreviewRouter,
  TagRouter,
]);
