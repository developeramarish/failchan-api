import chai from 'chai';
import supertest from 'supertest';
import { Container } from 'typedi';
import { getConnection, getCustomRepository, getRepository } from 'typeorm';
import { ReplyToThreadCommand } from '../../src/app/commands/post';
import {
  TEST_THREADS_LISTING_PREVIEW_POSTS,
  TEST_THREADS_LISTING_TAKE,
} from '../../src/app/commands/thread';
import { PostService } from '../../src/app/service/post.service';
import { Board } from '../../src/domain/entity/board';
import { Post } from '../../src/domain/entity/post';
import { Thread } from '../../src/domain/entity/thread';
import { BoardRepository } from '../../src/infra/repository/board.repo';
import { ThreadRepository } from '../../src/infra/repository/thread.repo';
import { ApplicationServer } from '../../src/server';

const replyToThread = async (thread, i: number) => {
  const postService = Container.get(PostService);
  const post = { body: `#${i}`, attachmentIds: [], referencies: [] };
  const command = new ReplyToThreadCommand({ ...post, threadId: thread.id });
  await postService.replyToThreadHandler(command);
};
const createThread = async (board) => {
  let thread = Thread.create(board);
  const threadRepo = getCustomRepository(ThreadRepository);
  thread = await threadRepo.save(thread);
  await replyToThread(thread, 1);
  await replyToThread(thread, 2);
  await replyToThread(thread, 3);
};

let app;
describe('Thread fetching', () => {
  before(async () => {
    app = await ApplicationServer.getApp();

    let board = new Board({ name: 'bred', slug: 'b' });
    const boardRepo = getCustomRepository(BoardRepository);
    board = await boardRepo.save(board);
    await createThread(board);
  });
  after(async () => {
    await ApplicationServer.connection.synchronize(true);
  });

  it('returns thread with correct order of its posts', (done) => {
    supertest(app).get('/threads/1')
      .end((err, res) => {
        chai.expect(res.status).to.eq(200);
        const thread = res.body.thread;
        chai.expect(thread.posts).to.have.lengthOf(3);
        chai.expect(thread.posts[0].body).to.eq('#1');
        chai.expect(thread.posts[1].body).to.eq('#2');
        chai.expect(thread.posts[2].body).to.eq('#3');
        done();
      });
  });
});