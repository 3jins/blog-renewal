// import { Service } from 'typedi';
// import fs from 'fs';
// import { CreatePostParamDto } from '@src/post/dto/PostParamDto';
// import PostRepository from '@src/post/repository/PostRepository';
//
// @Service()
// export default class PostService {
//   public constructor(private readonly postRepository: PostRepository) {
//   }
//
//   public createPost(paramDto: CreatePostParamDto): void {
//     const { post } = paramDto;
//     const rawContent: string = this.readPostContent(post.path);
//     const renderedContent = this.renderContent(rawContent);
//     this.postRepository.createPost({
//       ...paramDto,
//       title: post.name,
//       rawContent,
//       renderedContent,
//       createdDate: new Date(),
//     });
//   }
//
//   private readPostContent(path: string): string {
//     return fs.readFileSync(path).toString();
//   }
//
//   private renderContent(rawContent: string): string {
//     // TODO: 렌더링 로직 구현
//     return rawContent;
//   }
// }
