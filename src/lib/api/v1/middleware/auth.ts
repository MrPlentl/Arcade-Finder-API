import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../../../utils/environment.js';
import * as handler from '../controllers/handlers/auth.js';

import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[middleware|auth]'); // Sets up the logger with the [middleware|auth] string prefix

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
export async function validateAdminApiKey(req: Request, res: Response, next: NextFunction) {
  logger.trace('validateAdminApiKey');

  const { admin_apiKey } = req.body;

  // Verify apikey exists
  if (!admin_apiKey) {
    // 400 Bad Request
    // The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
    return res.status(400).json({ error: '{admin_apiKey} missing from request body' });
  }

  // Verify apikey matches the env file KEYMASTER_API_KEY
  // NOTE: Currently only the system Admin can create
  if (admin_apiKey !== env.KEYMASTER_API_KEY) {
    // 401 Unauthorized
    // Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
    return res.status(401).json({
      status: 'Error',
      message: 'Restricted access to Administrators only',
    });
  }

  // Validate Admin APIkey is actually in the apikey table
  const apiKeyId = await handler.validateApiKey(admin_apiKey);
  if (!apiKeyId) {
    return res.status(401).json({
      status: 'Error',
      message: 'Invalid API key',
    });
  }

  next();
}

/**
 * Middleware to verify JWT token
 *
 *
 */
export function authenticateToken(
  req: Request & { userToken?: string },
  res: Response,
  next: NextFunction,
) {
  logger.debug('authenticateToken');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const JWT_SECRET = env.JWT_SECRET || '';

  if (!token) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, { clockTolerance: 30 }, (err: any, decodedJWT: any) => {
    if (err) {
      logger.error('JWT verify error:', err.message);
      logger.error('Current UTC:', new Date().toISOString());

      logger.error(err);
      return res.status(401).json({ error: 'Invalid / Expired token' });
    }

    req.userToken = decodedJWT;
    next();
  });
}

/**
 * Validates the required permissions to access endpoint
 *
 * @param {*} requiredPermission
 * @returns
 */
export function hasRequiredPermission(requiredPermission: string) {
  return (req: Request & { userToken?: any }, res: Response, next: NextFunction) => {
    logger.trace('requiredPermission:', requiredPermission);
    const userPermissions = req?.userToken?.permissions;
    if (userPermissions.includes(requiredPermission)) {
      next();
    } else {
      return res.status(403).json({
        error: 'Access denied. Missing the required permission to access.',
      });
    }
  };
}
