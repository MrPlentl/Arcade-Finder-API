import { Request, Response } from 'express';
import { sampleMiddleware, setStdRespHeaders } from '../middleware/index.js';

const getPing = (req: Request, res: Response) => {
  console.log('PING JS -> WORKING PING NEW!');
  return res.status(200).send('pong');
};

export default {
  getPing: [sampleMiddleware, setStdRespHeaders, getPing],
};
