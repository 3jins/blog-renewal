import Post from './Post';

const test = async () => {
  await Post.insertMany([{
    title: 'hello',
    content: 'world',
  }]);
}