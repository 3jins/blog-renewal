/* eslint-disable import/first */

/* istanbul ignore next */
process.env.NODE_ENV = process.env.NODE_ENV === undefined ? 'test' : process.env.NODE_ENV;

import { connectToDb, startApp } from '@src/app';
import CategoryRouter from '@src/category/CategoryRouter';
import HomeRouter from '@src/home/HomeRouter';
import ImageRouter from '@src/image/ImageRouter';
import PostRouter from '@src/post/PostRouter';
import TagRouter from '@src/tag/TagRouter';

connectToDb();
startApp([
  CategoryRouter,
  HomeRouter,
  ImageRouter,
  PostRouter,
  TagRouter,
]);
