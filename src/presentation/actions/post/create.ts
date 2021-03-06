import { inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { IOC_TYPE } from '../../../config/type';
import { IAction } from '../../../app/interfaces/action';
import { AttachmentService } from '../../../app/service/attachment.service';
import { PostService } from '../../../app/service/post.service';

interface IRequest {
  body: string;
  attachment: string;
  references: number[];
  threadId: number;
}

@provide(IOC_TYPE.CreatePostAction)
export class CreatePostAction implements IAction {
  constructor(
    @inject(IOC_TYPE.AttachmentService) public attachmentService: AttachmentService,
    @inject(IOC_TYPE.PostService) public postService: PostService,
  ) { }
  async execute(request: IRequest) {
    const attachmentIds = request.attachment
      ? await this.attachmentService.createFromCache(request.attachment)
      : [];

    const newRequest = {
      attachmentIds,
      body: request.body,
      references: request.references,
      threadId: request.threadId,
    };
    return this.postService.replyToThread(newRequest);
  }
}
