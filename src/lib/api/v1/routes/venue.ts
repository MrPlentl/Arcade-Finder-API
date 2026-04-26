import { Request, Response } from 'express';
import { PERMISSIONS } from '../../utils/constants.js';

import * as auth from '../middleware/auth.js';
import { setStdRespHeaders } from '../middleware/index.js';
import * as controller from '../controllers/venue.js';
import { standardResponse } from '../../utils/helpers.js';

import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[routes|venue]'); // Sets up the logger with the [app] string prefix

////////////////////////
// READ

/**
 * Returns information about a single venue based on the provided slug or ID
 *
 * GET /venue
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @returns {Promise<Response>} Standardized response containing venue data
 */
const getVenueById = async (req: Request, res: Response): Promise<Response> => {
  logger.trace('getVenueById');
  const response = await controller.fetchVenueById(req);
  return res.status(200).send(standardResponse(response, false));
};

/**
 * Returns a list of venues that match the search queries
 *
 * GET /venue/search
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getVenues = async (req: Request, res: Response) => {
  logger.trace('getVenues');
  const response = await controller.fetchVenues(req);
  return res.status(200).send(standardResponse(response));
};

export default {
  getVenues: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.READ),
    getVenues,
  ],
  getVenueById: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.READ),
    getVenueById,
  ],
};
