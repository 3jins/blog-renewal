import { connectToDb, startApp } from '@src/app';
import HomeRouter from '@src/home/HomeRouter';
import ImageRouter from '@src/image/ImageRouter';

connectToDb();
startApp([HomeRouter, ImageRouter]);
