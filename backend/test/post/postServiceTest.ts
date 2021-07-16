// import { should } from 'chai';
// import { capture, instance, mock } from 'ts-mockito';
// import fs from 'fs';
// import { File } from 'formidable';
// import PostService from '@src/post/PostService';
// import PostRepository from '@src/post/repository/PostRepository';
// import { CreatePostRepoParamDto } from '@src/post/dto/PostRepoParamDto';
// import { CreatePostParamDto } from '@src/post/dto/PostParamDto';
// import { appPath, common as commonTestData } from '@test/data/testData';
//
// describe('PostService test', () => {
//   let postService: PostService;
//   let postRepository: PostRepository;
//   let serviceParamDto: CreatePostParamDto;
//   let post: File;
//   let fileContent: string;
//
//   before(() => {
//     const fileName = 'test.md';
//     const filePath = `${appPath.testData}/${fileName}`;
//     const fileStream: Buffer = fs.readFileSync(filePath);
//     fileContent = fileStream.toString();
//     const fileStat: fs.Stats = fs.statSync(filePath);
//     post = {
//       size: fileStream.byteLength,
//       path: filePath,
//       name: fileName,
//       type: 'application/octet-stream',
//       lastModifiedDate: fileStat.mtime,
//       toJSON(): Object {
//         return {};
//       },
//     };
//
//     serviceParamDto = {
//       post,
//       ...commonTestData.post1,
//     };
//     postRepository = mock(PostRepository);
//     postService = new PostService(instance(postRepository));
//     should();
//   });
//
//   it('post create test', () => {
//     const date1 = new Date();
//     postService.createPost(serviceParamDto);
//     const date2 = new Date();
//
//     const [repoParamDto] = capture<CreatePostRepoParamDto>(postRepository.createPost).last();
//     repoParamDto.title.should.equal(post.name);
//     repoParamDto.rawContent.should.equal(fileContent);
//     repoParamDto.renderedContent.should.equal(fileContent); // TODO: should be fixed
//     repoParamDto.createdDate.should.within(date1, date2);
//   });
// });
