import { Request, Response } from 'express';
import env from '../../../utils/environment.js';
import { sampleMiddleware } from '../middleware/index.js';
import { log4js } from '../../../../utils/log4js.js';

const logger = log4js.getLogger('[routes|index]'); // Sets up the logger with the [app] string prefix

const getIndex = (req: Request, res: Response) => {
  logger.trace('getIndex');
  const indexResponse = {
    message: 'Welcome to the Arcade Finder API!',
    details: {
      name: env.APP_NAME || 'Arcade Finder API',
      version: '0.2.1',
      documentation: 'http://localhost:8080/specs.html',
    },
  };
  return res.status(200).send(JSON.stringify(indexResponse));
};

export default {
  getIndex: [sampleMiddleware, getIndex],
};
