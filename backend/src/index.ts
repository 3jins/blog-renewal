import { connectToDb, startApp } from '@src/app';
import HomeRouter from '@src/home/HomeRouter';
import PostRouter from '@src/post/PostRouter';
import ImageRouter from '@src/image/ImageRouter';

connectToDb();
startApp([HomeRouter, PostRouter, ImageRouter]);
