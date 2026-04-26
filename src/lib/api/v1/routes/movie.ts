import { Request, Response } from 'express';
import { PERMISSIONS } from '../../utils/constants.js';

import * as auth from '../middleware/auth.js';
import { setStdRespHeaders } from '../middleware/index.js';
import * as controller from '../controllers/movie.js';

import { log4js } from '../../../../utils/log4js.js';
import { standardResponse } from '../../utils/helpers.js';
const logger = log4js.getLogger('[routes|movie]'); // Sets up the logger with the [app] string prefix

////////////////////////
// CREATE

/**
 * Returns the information on a single Movie based on the given video game
 *
 * GET /movie/{movie_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const createMovie = async (req: Request, res: Response) => {
  logger.trace('createMovie:', req?.body?.name);
  const [statusCode, response] = await controller.createNewMovie(req);
  return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// READ

/**
 * Returns a complete list of movies that are based on Video Games
 *
 * GET /movies
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getMovies = async (req: Request, res: Response): Promise<Response> => {
  logger.trace('getMovies');
  const response = await controller.fetchAllMovies(req);
  return res.status(200).send(standardResponse(response));
};

/**
 * Returns the information on a single Movie based on the given video game
 *
 * GET /movie/{movie_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getMovieById = async (req: Request, res: Response) => {
  logger.trace('getMovieById:', req?.params?.movieId);
  const [statusCode, response] = await controller.fetchMovieById(req);
  return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// UPDATE

/**
 * Returns the information on a single Movie based on the given video game
 *
 * GET /movie/{movie_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const updateMovieInfo = async (req: Request, res: Response) => {
  logger.trace('updateMovieInfo:', req?.params?.movieId);
  const [statusCode, response] = await controller.updateMovieById(req);
  return res.status(statusCode as number).send(JSON.stringify(response));
};

////////////////////////
// DELETE

const deleteMovie = async (req: Request, res: Response) => {
  logger.trace('deleteMovie:', req?.params?.movieId);
  const [statusCode, response] = await controller.deleteMovieById(req);

  if (statusCode === 204) {
    return res.status(statusCode as number).send();
  }

  return res.status(statusCode as number).send(JSON.stringify(response));
};

export default {
  getMovies: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.READ),
    getMovies,
  ],
  getMovieById: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.READ),
    getMovieById,
  ],
  updateMovieInfo: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.MOVIE.UPDATE),
    updateMovieInfo,
  ],
  createMovie: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.MOVIE.CREATE),
    createMovie,
  ],
  deleteMovie: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.MOVIE.DELETE),
    deleteMovie,
  ],
};
