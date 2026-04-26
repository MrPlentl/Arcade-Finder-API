import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[controller|show]'); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from '../../utils/error.js';

import { Show } from '../../../../database/models/index.js';

/**
 * CREATE a new Show
 *
 * @param {*} req
 * @returns
 */
export async function createNewShow(req: any): Promise<[number, any]> {
  logger.trace('createNewShow:', req?.body?.name);
  const data = req?.body;
  // VALIDATE DATA HERE
  try {
    const response = (await Show.create(data)) || {};
    return [200, response];
  } catch (error: any) {
    logger.error('SQL Error in Show.create:', error.message);
    error.httpStatusCode = 400;
    let msg =
      'An error occured while creating a new Show. Check the details and please try again. Contact Support if the problem presists.';
    if (error.code == 23505) {
      msg =
        'Duplicate Show Detected: A show already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.';
    }
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * FETCH All Shows
 *
 * @param {*} req
 * @returns
 */
export async function fetchAllShows(req: any): Promise<[number, any]> {
  logger.trace('fetchAllShows:', req?.query?.sortBy);
  const orderBy = req?.query?.sortBy || 'id'; // Check if the sortBy parameter was set. default: "id"
  try {
    return [200, await Show.getAll(orderBy)];
  } catch (error: any) {
    logger.error('SQL Error in Show.getAll:', error.message);
    const msg =
      'An error occured while fetching shows. Please try again later and contact Support if the problem presists.';
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * FETCH Show by Id
 *
 * @param {*} req
 * @returns
 */
export async function fetchShowById(req: any): Promise<[number, any]> {
  logger.trace('fetchShowById:', req?.params?.showId);
  const id = req?.params?.showId || 99;
  try {
    const response = (await Show.getById(id)) || {};
    return [200, response];
  } catch (error: any) {
    logger.error('SQL Error in Show.getById:', error.message);
    const msg = `An error occured while fetching the show with id: ${id}. Please try again later and contact Support if the problem presists.`;
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * UPDATE Show
 *
 * @param {*} req
 * @returns
 */
export async function updateShowById(req: any): Promise<[number, any]> {
  logger.trace('updateShowById:', req?.params?.showId);
  const id = req?.params?.showId || 99;
  const data = req?.body;

  try {
    const response = (await Show.update(id, data)) || {};
    return [200, response];
  } catch (error: any) {
    logger.error('SQL Error in Show.update:', error.message);
    error.httpStatusCode = 400;
    let msg =
      'An error occured while creating a new Show. Check the details and please try again. Contact Support if the problem presists.';
    if (error.code == 23505) {
      msg =
        'Duplicate Show Detected: A show already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.';
    }
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * DELETE Show
 *
 * @param {*} req
 * @returns
 */
export async function deleteShowById(req: any): Promise<[number, any]> {
  logger.trace('deleteShowById:', req?.params?.showId);
  try {
    const id = req?.params?.showId;
    const response = await Show.delete(id);
    return [204, response];
  } catch (error: any) {
    logger.error('SQL Error in Show.delete:', error.message);
    error.httpStatusCode = 404;
    const msg = 'Error Deleting show';
    return formatErrorResponse(sqlError(error, msg));
  }
}
