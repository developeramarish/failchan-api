
import { Repository } from 'typeorm';
import { Thread } from './entity/thread';

export interface IThreadRepository {
  findOneOrFail: Repository<Thread>['findOneOrFail'];
  getThreadsWithPreviewPosts(
    boardId: number,
    findOptions: {
      previewPosts: number,
      skip?: number,
      take?: number,
    },
  ): Promise<Thread[]>;
}
