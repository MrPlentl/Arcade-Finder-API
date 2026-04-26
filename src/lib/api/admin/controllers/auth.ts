import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import env from '../../../utils/environment.js';
import { formatErrorResponse, predefinedError } from '../../utils/error.js';
import { getClientIP } from '../../utils/helpers.js';
import * as handler from './handlers/auth.js';
import { Apikey, User } from '../../../../database/models/index.js';
import { log4js } from '../../../../utils/log4js.js';

const logger = log4js.getLogger('[admin|controller|auth]'); // Sets up the logger with the [app] string prefix

interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  jti?: string;
  ip?: string | string[] | undefined;
  uuid?: string;
  roles?: any[];
  accessLevel?: string;
  applicationId?: string;
  permissions?: any[];
}

/**
 * Generates a new ApiKey and stores the Hashed Key and a Lookup Hash for retreival
 *
 * @param {*} req The HTTP Request object
 * @returns [httpStatucCode, access_token]
 */
export async function generateApiKey(userId: number): Promise<[number, any]> {
  const apiKey = crypto.randomBytes(32).toString('hex'); // Generate a random API key

  const storeApiKey = {
    lookup_hash: await handler.generateLookupHash(apiKey),
    hashed_key: await bcrypt.hash(apiKey, 10),
  };

  try {
    const response = await Apikey.create(storeApiKey);
    if (response) {
      // # Update User Record
      // @TODO: Update user record (userId) with the new ApiKey id (response.id)
      logger.debug(`Add ApiKey ID: ${response.id} for UserId: ${userId}`);
      return [200, { apiKey }];
    }
    return [500, { message: 'Internal Error: Unable to create API Key at this time.' }];
  } catch (error: any) {
    error.details = { sql_error: error.message };
    error.message = 'Internal Error: Unable to create API Key at this time.';
    return formatErrorResponse(error) as [number, any];
  }
}

/**
 * Create an Access Token for the user to authenticate with
 *
 * @param {*} req The HTTP Request object
 * @returns [httpStatucCode, access_token]
 */
export async function fetchAccessToken(req: any): Promise<[number, any]> {
  logger.trace('fetchAccessToken');
  const apiKey = req.headers['apikey'];

  try {
    const apikeyID: number = await handler.validateApiKey(apiKey); // Validate Apikey is in apikey table
    const tokenLife = 3600; // Token's life is 1 hour (3600 seconds)
    const jwtPayload: JwtPayload = {};

    const user = await User.getByApikeyId(apikeyID);
    if (!user) {
      throw predefinedError('UserNotFound');
    }
    const userPermissions = await User.getPermissionsById(user.id as number);
    const userRoles = await User.getRolesById(user.id as number);

    // Create JWT Information

    // Standard JWT claims
    jwtPayload.iss = 'https://api.arcadefinder.com'; // (Issuer): Identifies the authority that issued the token.
    jwtPayload.sub = user.display_name; // (Subject): The unique identifier for the user.
    jwtPayload.aud = 'https://api.arcadefinder.com'; // (Audience): The intended recipient of the token (e.g., an API).
    jwtPayload.jti = uuidv4(); // (JWT ID): A unique identifier for the token (prevents replay attacks).

    // Public Claims
    jwtPayload.ip = getClientIP(req); // The IP address the token was issued from (for tracking/fraud detection).
    jwtPayload.uuid = user.uuid; // (User UUID) The users uuid
    jwtPayload.roles = userRoles; // The set of roles that were assigned to the user who is logging in
    jwtPayload.accessLevel = userRoles[0].toLowerCase(); // This is supposed to be the userRole if there was only one
    jwtPayload.applicationId = env.APP_ID;
    jwtPayload.permissions = userPermissions;

    jwtPayload.uuid = user.uuid;
    //////////////////////////////////

    // Generate JWT token
    const access_token = jwt.sign(jwtPayload, env.JWT_SECRET || '', {
      expiresIn: tokenLife,
    });

    // @TODO: Write to file or cache

    // Additional information for the user to go along side the access_token
    // origin: ibm
    const refresh_token = 'Not Suported';
    const token_type = 'Bearer';
    const expires_in = tokenLife;
    const expiration = Math.floor(Date.now() / 1000) + tokenLife;
    const scope = env.APP_NAME;

    // Return access_token
    return [
      200,
      {
        access_token,
        refresh_token,
        token_type,
        expires_in,
        expiration,
        scope,
      },
    ];
  } catch (error) {
    return formatErrorResponse(error as any) as [number, any];
  }
}
