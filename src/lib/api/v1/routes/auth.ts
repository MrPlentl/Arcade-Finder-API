import { Request, Response, NextFunction } from 'express';
// import env from "../../../utils/environment.js";
import { setStdRespHeaders } from '../middleware/index.js';
import * as auth from '../middleware/auth.js';
import * as controller from '../controllers/auth.js';

import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[routes|auth]'); // Sets up the logger with the [app] string prefix

/**
 * Authenticate the given ApiKey and return a valid access_token
 *
 * @param {*} req
 * @param {*} res
 * @returns access_token The user will use this access_token in order to do anything within the API
 */
const getAccessToken = async (req: Request, res: Response): Promise<void> => {
  logger.trace('getAccessToken');
  const [statusCode, response] = await controller.fetchAccessToken(req);
  res.status(statusCode).send(JSON.stringify(response));
};

/**
 * Create a new API key in the Apikey table
 * Currently using the master KEY in the env file, this needs to be updated to use an Auth Token
 *
 * @TODO
 * - Need to make this route PRIVATE in the documentation
 * - Need to assign the new key to the user record when it is created
 * - The specification limit on the User ID needs to be raised in the event there are more than the listed amount of users
 *
 * @param {*} req
 * @param {*} res
 * @returns apikey The newly created apikey
 */
const createApiKey = async (req: Request, res: Response): Promise<void> => {
  logger.trace('createApiKey:', req?.body?.admin_apiKey);
  logger.trace('user:', req?.params?.userId);

  // # Lookup User (
  // @TODO: Validate the user exists, is Active and is not Deleted or Suspended
  // if (user is invalid)
  // return 401

  const [statusCode, response] = await controller.generateApiKey(
    Array.isArray(req?.params?.userId) ? req.params.userId[0] : req.params.userId,
  );
  res.status(statusCode).send(JSON.stringify(response));
};

const validateLogin = async (req: Request, res: Response): Promise<void> => {
  logger.trace('validateLogin');
  const [statusCode, response] = await controller.validateLogin(req);
  res.status(statusCode).send(JSON.stringify(response));
};

const createUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  logger.trace('createUserAccount');
  const result = await controller.createUserAccount(req, res, next);
  if (Array.isArray(result)) {
    const [statusCode, response] = result;
    res.status(statusCode as number).send(JSON.stringify(response));
  }
};

export default {
  createApiKey: [setStdRespHeaders, auth.validateAdminApiKey, createApiKey],
  createUserAccount: [setStdRespHeaders, createUserAccount],
  getAccessToken: [setStdRespHeaders, getAccessToken],
  validateLogin: [setStdRespHeaders, validateLogin],
};
