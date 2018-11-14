import R from 'ramda';
import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Board } from '../../domain/entity/board';
import { Thread } from '../../domain/entity/thread';
import { IPostService } from '../../domain/interfaces/post.service';
import { IThreadService } from '../../domain/interfaces/thread.service';
import { BoardRepository } from '../../infra/repository/board.repo';
import { ThreadRepository } from '../../infra/repository/thread.repo';
import { PostService } from './post.service';

@Service()
export class ThreadService implements IThreadService {
  constructor(
    @InjectRepository(Thread) private threadRepo: ThreadRepository,
    @InjectRepository(Board) private boardRepo: BoardRepository,
    @Inject(type => PostService) private postService: IPostService,
  ) { }

  async create(request: {
    post: {
      body: string;
      attachmentIds: number[];
      referencies: number[];
      threadId: number;
    };
    boardSlug: string;
  }): Promise<Thread> {
    const board = await this.boardRepo.getBySlug(request.boardSlug);
    const thread = Thread.create(board);
    const { id: threadId } = await this.threadRepo.save(thread);
    const replyRequest = {
      ...request.post,
      threadId,
    };
    await this.postService.replyToThread(replyRequest);
    return this.getThreadWithPosts(threadId);
  }

  async listThreadsByBoard(params: {
    boardSlug: string,
    previewPosts: number,
    take: number,
    skip: number,
  }): Promise<Thread[]> {
    const board = await this.boardRepo.getBySlug(params.boardSlug);
    return this.threadRepo
      .getThreadsWithPreviewPosts(board.id, R.omit(['boardSlug'], params));
  }
  async getThreadWithPosts(threadId: number): Promise<Thread> {
    const thread = await this.threadRepo.getThreadWithRelations(threadId);
    thread.sortPosts();
    return thread;
  }
}
