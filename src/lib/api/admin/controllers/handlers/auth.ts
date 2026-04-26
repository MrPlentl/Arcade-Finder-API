import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { hasExpiredDate } from '../../../utils/helpers.js';
import { predefinedError } from '../../../utils/error.js';
import { Apikey } from '../../../../../database/models/index.js';
import { log4js } from '../../../../../utils/log4js.js';
import env from '../../../../utils/environment.js';

const logger = log4js.getLogger('[controller|handlers|auth]'); // Sets up the logger with the [app] string prefix

/**
 * Creates a lookup has for the given apikey that will be used to locate the valid apikey Hash
 *
 * @param {*} apikey
 * @returns
 */
export async function generateLookupHash(apikey: string): Promise<string> {
  logger.trace('generateLookupHash:', 'apikey-****');
  return crypto.createHash('sha256').update(apikey).digest('hex').slice(0, 16);
}

/**
 * Get the stored hash using the lookup hash
 *
 * @param {*} req
 * @returns
 */
async function fetchApikeyByLookupHash(lookupHash: string): Promise<any> {
  logger.trace('fetchApikeyByLookupHash:', lookupHash);
  let apikeyRecord; // Declare before try block
  try {
    apikeyRecord = await Apikey.getByLookupHash(lookupHash);
  } catch (error: any) {
    const newError: any = predefinedError('Apikey.getByLookupHash');
    newError.code = error.code;
    newError.details = { sql_error: error.message };
    newError.message = 'Internal Error: Unable to validate access_token at this time.';
    throw newError;
  }

  // Verify ApiKey is not expired
  if (!apikeyRecord?.expires_at || hasExpiredDate(apikeyRecord.expires_at)) {
    const newError: any = predefinedError('ApiKeyExpired');
    if (apikeyRecord?.expires_at) {
      newError.details.trace = {
        apikey_id: `${apikeyRecord?.id}.${lookupHash}`,
        expired_at: apikeyRecord?.expires_at,
      };
    }
    throw newError;
  }

  return apikeyRecord;
}

/**
 * Validates that the give apikey is actually a vaild ApiKey by using a lookup hash
 *
 * @param {*} providedKey
 * @returns
 */
export async function validateApiKey(providedKey: string): Promise<number> {
  logger.trace('validateApiKey');
  const lookupHash = await generateLookupHash(providedKey);

  // Get the stored hash using the lookup hash
  const apikeyRecord = await fetchApikeyByLookupHash(lookupHash);

  // return apikeyRecord ID if there is a match
  if (await bcrypt.compare(providedKey, apikeyRecord?.hashed_key)) {
    return apikeyRecord?.id;
  }

  throw predefinedError('ApiKeyExpired');
}

/**
 * verify JWT token
 *
 *
 */
export function authenticateToken(req: any) {
  logger.debug('authenticateToken');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const JWT_SECRET: string | undefined = env.JWT_SECRET;

  if (!token || !JWT_SECRET) {
    return false;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decodedJWT: any) => {
    if (err) {
      return false;
    }

    req.userToken = decodedJWT; // Add the decoded userToken onto the request object
    console.debug(req.userToken); // @TODO: REMOVE this log line
  });
}
