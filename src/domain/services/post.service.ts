import { Service } from 'typedi';
import { Post } from '../entity/post';
import { Thread } from '../entity/thread';
import { IReply } from '../interfaces/reply';

@Service()
export class DomainPostService {
  constructor() { }

  replyToThread(reply: IReply): { post: Post, thread: Thread, refs: Post[] } {
    const { thread, attachments, referencies, body } = reply;
    const post = Post.create(body, referencies, attachments);
    thread.bump();
    post.thread = thread;
    // thread.posts = [post];
    post.addPostToRefsReplies();
    const refs = post.referencies;
    return { post, thread, refs };
  }
  syncReferencies(post: Post, newReferencies: Post[]): Post[] {
    const newRefsIds = newReferencies.map(r => r.id);
    const idsToRemove = post.referencies
      .filter(p => !newRefsIds.includes(p.id))
      .map(p => p.id);
    const removedRefs = post.removeReferenciesByIds(idsToRemove);
    post.referencies = newReferencies;
    post.addPostToRefsReplies();
    return [...removedRefs, ...newReferencies];
  }
}
