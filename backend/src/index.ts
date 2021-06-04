import { connectToDb, startApp } from '@src/app';
import HomeRouter from '@src/home/HomeRouter';
import ImageRouter from '@src/image/ImageRouter';
import PostRouter from '@src/post/PostRouter';
import TagRouter from '@src/tag/TagRouter';

connectToDb();
startApp([HomeRouter, PostRouter, ImageRouter, TagRouter]);
