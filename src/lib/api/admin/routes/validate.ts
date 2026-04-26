// import env from "../../../utils/environment.js";

import { PERMISSIONS } from '../../utils/constants.js';

import * as auth from '../middleware/auth.js';
import { setStdRespHeaders } from '../middleware/index.js';
import * as controller from '../controllers/validate.js';
import { getIgdbAccessToken } from '../../../../services/igdb/controller.js';
import { igdbApikeyCache } from '../../../../utils/lruCache.js';

import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[ADMIN|routes|validate]'); // Sets up the logger with the [app] string prefix

////////////////////////
// READ
/**
 * Validates
 *
 * GET /validate
 * @param {*} req
 * @param {*} res
 * @returns
 */
const validateAction = async (req: any, res: any) => {
  const action = req?.params?.action;
  logger.trace('validateAction');
  try {
    let token = igdbApikeyCache.get('igdb_token');
    // Check cache
    if (token) {
      logger.trace('Cache Found');
    } else {
      logger.trace('No Cache Found!');
      token = await getIgdbAccessToken();
      igdbApikeyCache.set('igdb_token', token);
    }

    logger.trace('IGDB token:', token);

    const test = await controller.fetchVenue(req); // your other logic
    logger.trace(test);

    return res.status(200).send(JSON.stringify(`Validate Success: ${req?.params?.action}`));
  } catch (err: any) {
    console.error('Error in validateAction:', err);
    return res.status(500).json({ error: 'Failed to get IGDB token' });
  }
};

export default {
  validateAction: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.ADMIN.VALIDATE),
    validateAction,
  ],
};
