import { Request, Response } from 'express';
// import env from "../../../utils/environment.js";
import { authenticateToken } from '../middleware/auth.js';
import { setStdRespHeaders } from '../middleware/index.js';
import * as controller from '../controllers/show.js';

import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[routes|show]'); // Sets up the logger with the [app] string prefix

////////////////////////
// CREATE

/**
 * Returns the information on a single Show based on the given video game
 *
 * GET /show/{show_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const createShow = async (req: Request, res: Response) => {
  logger.trace('createShow:', req?.body?.name);
  const [statusCode, response] = await controller.createNewShow(req);
  return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// READ

/**
 * Returns a complete list of shows that are based on Video Games
 *
 * GET /shows
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getShows = async (req: Request, res: Response) => {
  logger.trace('getShows');
  const [statusCode, response] = await controller.fetchAllShows(req);
  return res.status(statusCode as number).send(JSON.stringify(response));
};

/**
 * Returns the information on a single Show based on the given video game
 *
 * GET /show/{show_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getShowById = async (req: Request, res: Response) => {
  logger.trace('getShowById:', req?.params?.showId);
  const [statusCode, response] = await controller.fetchShowById(req);
  return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// UPDATE

/**
 * Returns the information on a single Show based on the given video game
 *
 * GET /show/{show_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const updateShowInfo = async (req: Request, res: Response) => {
  logger.trace('updateShowInfo:', req?.params?.showId);
  const [statusCode, response] = await controller.updateShowById(req);
  return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// DELETE

const deleteShow = async (req: Request, res: Response) => {
  logger.trace('deleteShow:', req?.params?.showId);
  const [statusCode, response] = await controller.deleteShowById(req);

  if (statusCode === 204) {
    return res.status(statusCode as number).send();
  }

  return res.status(statusCode as number).send(JSON.stringify(response));
};

export default {
  getShows: [setStdRespHeaders, authenticateToken, getShows],
  getShowById: [setStdRespHeaders, authenticateToken, getShowById],
  updateShowInfo: [setStdRespHeaders, authenticateToken, updateShowInfo],
  createShow: [setStdRespHeaders, authenticateToken, createShow],
  deleteShow: [setStdRespHeaders, authenticateToken, deleteShow],
};
