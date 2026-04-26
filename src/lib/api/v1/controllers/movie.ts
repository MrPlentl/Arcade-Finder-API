import { Request } from 'express';
// import env from "../../../utils/environment.js";
import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[controller|movie]'); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from '../../utils/error.js';

import { Movie } from '../../../../database/models/index.js';
import { buildExternalLink } from '../../utils/helpers.js';

interface MovieData {
  id: number;
  name: string;
  year: number;
  link_imdb: string | null;
  link_letterboxd: string | null;
  link_justwatch: string | null;
}

/// Helper function to format movie data with external links
const formatMovie = (movie: MovieData) => {
  if (movie.link_imdb) {
    movie.link_imdb = buildExternalLink('IMDB', movie.link_imdb);
  }
  if (movie.link_letterboxd) {
    movie.link_letterboxd = buildExternalLink('LETTERBOXD', movie.link_letterboxd);
  }
  if (movie.link_justwatch) {
    movie.link_justwatch = buildExternalLink('JUSTWATCH', movie.link_justwatch);
  }
  return movie;
};

/**
 * CREATE a new Movie
 *
 * @param {*} req
 * @returns
 */
export async function createNewMovie(req: Request) {
  logger.trace('createNewMovie:', req?.body?.name);
  const data = req?.body;
  // VALIDATE DATA HERE
  try {
    const response = (await Movie.create(data)) || {};
    return [200, response];
  } catch (error: any) {
    logger.error('SQL Error in Movie.create:', error.message);
    error.httpStatusCode = 400;
    let msg =
      'An error occured while creating a new Movie. Check the details and please try again. Contact Support if the problem presists.';
    if (error.code == 23505) {
      msg =
        'Duplicate Movie Detected: A movie already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.';
    }
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * FETCH All Movies
 *
 * @param {*} req
 * @returns
 */
export async function fetchAllMovies(req: Request) {
  logger.trace('fetchAllMovies:', req?.query?.sortBy);
  const orderBy = (req?.query?.sortBy as string) || 'id'; // Check if the sortBy parameter was set. default: "id"
  try {
    const movies: MovieData[] = await Movie.getAll(orderBy);

    const response = movies.map(formatMovie);

    return response;
  } catch (error: any) {
    logger.error('SQL Error in Movie.getAll:', error.message);
    const msg =
      'An error occured while fetching movies. Please try again later and contact Support if the problem presists.';
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * FETCH Movie by Id
 *
 * @param {*} req
 * @returns
 */
export async function fetchMovieById(req: Request) {
  logger.trace('fetchMovieById:', req?.params?.movieId);
  const useId = req.headers['x-use-id'] === 'true'; // Check if the x-use-id header is set to "true"

  try {
    let response;
    if (useId) {
      const id: number = Number(req?.params?.movieId) || 99;
      response = await Movie.getById(id);
    } else {
      const slug: string = (req?.params?.movieId as string) || '';
      response = await Movie.getBySlug(slug);
    }
    return [200, formatMovie(response)];
  } catch (error: any) {
    logger.error('SQL Error in Movie.getById:', error.message);
    const msg = `An error occured while fetching the movie with id: ${req?.params?.movieId}. Please try again later and contact Support if the problem presists.`;
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * UPDATE Movie
 *
 * @param {*} req
 * @returns
 */
export async function updateMovieById(req: Request) {
  logger.trace('updateMovieById:', req?.params?.movieId);
  const id: number = Number(req?.params?.movieId) || 99;
  const data = req?.body;

  try {
    const response = (await Movie.update(id, data)) || {};
    return [200, response];
  } catch (error: any) {
    logger.error('SQL Error in Movie.update:', error.message);
    error.httpStatusCode = 400;
    let msg =
      'An error occured while creating a new Movie. Check the details and please try again. Contact Support if the problem presists.';
    if (error.code == 23505) {
      msg =
        'Duplicate Movie Detected: A movie already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.';
    }
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * DELETE Movie
 *
 * @param {*} req
 * @returns
 */
export async function deleteMovieById(req: Request) {
  logger.trace('deleteMovieById:', req?.params?.movieId);
  try {
    const id: number = Number(req?.params?.movieId);
    const response = await Movie.delete(id);
    return [204, response];
  } catch (error: any) {
    logger.error('SQL Error in Movie.delete:', error.message);
    error.httpStatusCode = 404;
    const msg = 'Error Deleting movie';
    return formatErrorResponse(sqlError(error, msg));
  }
}
