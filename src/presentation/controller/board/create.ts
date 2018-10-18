import { Request, Response } from 'express';
import { Container } from 'typedi';
import { BoardService } from '../../../app/service/board.service';

export async function boardsCreateAction(request: Request, response: Response) {
  const service = Container.get(BoardService);
  const createdBoard = await service.create(request.body);
  response.json({ board: createdBoard });
}