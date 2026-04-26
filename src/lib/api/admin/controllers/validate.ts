// import env from "../../../utils/environment.js";
import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[ADMIN|controller|validate]'); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from '../../utils/error.js';

import { Venue } from '../../../../database/models/index.js';

/**
 * FETCH All Venues
 *
 * @param {*} req
 * @returns
 */
export async function fetchVenue(req: any): Promise<[number, any]> {
  logger.trace('fetchVenue');
  const venueId = parseInt(req?.params?.venueId, 10) || 1;
  try {
    return [200, await Venue.getById(venueId)];
  } catch (error: any) {
    logger.error('SQL Error in Venue.getById:', error.message);
    const msg =
      'An error occured while fetching movies. Please try again later and contact Support if the problem presists.';
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * FETCH All Venues
 *
 * @param {*} req
 * @returns
 */
export async function fetchUserAccess(req: any): Promise<[number, any]> {
  logger.trace('fetchUserAccess');
  const venueId = parseInt(req?.params?.venueId, 10) || 1;
  try {
    return [200, await Venue.getById(venueId)];
  } catch (error: any) {
    logger.error('SQL Error in Venue.getById:', error.message);
    const msg =
      'An error occured while fetching movies. Please try again later and contact Support if the problem presists.';
    return formatErrorResponse(sqlError(error, msg));
  }
}
