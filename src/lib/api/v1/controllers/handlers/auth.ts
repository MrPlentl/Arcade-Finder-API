import bcrypt from 'bcrypt';
import crypto from 'crypto';
// Note: Ensure your helpers and Apikey model are importing the interfaces or classes correctly
import { hasExpiredDate } from '../../../utils/helpers.js';
import { predefinedError, CustomError } from '../../../utils/error.js';
import { Apikey, IApikey, User } from '../../../../../database/models/index.js';
import { log4js } from '../../../../../utils/log4js.js';

const logger = log4js.getLogger('[controller|handlers|auth]');

/**
 * Creates a lookup hash for the given apikey that will be used to locate the valid apikey Hash
 *
 * @param apikey - The raw API key string
 * @returns The first 16 chars of the SHA256 hash
 */
export async function generateLookupHash(apikey: string): Promise<string> {
  // logger.trace("generateLookupHash:", "apikey-****");
  return crypto.createHash('sha256').update(apikey).digest('hex').slice(0, 16);
}

/**
 * Get the stored hash using the lookup hash
 *
 * @param lookupHash - The partial hash used for looking up the record
 * @returns The Apikey record from the database
 */
async function fetchApikeyByLookupHash(lookupHash: string): Promise<IApikey | null> {
  logger.trace('fetchApikeyByLookupHash:', lookupHash);

  let apikeyRecord: IApikey | null;

  try {
    apikeyRecord = (await Apikey.getByLookupHash(lookupHash)) as IApikey | null;
  } catch (error: any) {
    const newError = predefinedError('Apikey.getByLookupHash') as CustomError;
    newError.code = error.code || 'DB_ERROR';
    newError.details = { sql_error: error.message };
    newError.message = 'Internal Error: Unable to validate access_token at this time.';
    throw newError;
  }

  // If no record found, return null immediately (let the validator handle it)
  if (!apikeyRecord) {
    return null;
  }

  // Verify ApiKey is not expired
  if (apikeyRecord.expires_at && hasExpiredDate(apikeyRecord.expires_at)) {
    const newError = predefinedError('ApiKeyExpired') as CustomError;

    // Initialize details if it doesn't exist (safety check)
    newError.details = newError.details || {};

    newError.details.trace = {
      apikey_id: `${apikeyRecord.id}.${lookupHash}`,
      expired_at: apikeyRecord.expires_at,
    };
    throw newError;
  }

  return apikeyRecord;
}

/**
 * Validates that the give apikey is actually a valid ApiKey by using a lookup hash
 *
 * @param providedKey - The raw API key to validate
 * @returns The ID of the validated key
 */
export async function validateApiKey(providedKey: string): Promise<string | number> {
  logger.trace('validateApiKey');

  const lookupHash = await generateLookupHash(providedKey);

  // Get the stored hash using the lookup hash
  const apikeyRecord = await fetchApikeyByLookupHash(lookupHash);

  // TS Check: Ensure record exists before trying to compare passwords
  // If apikeyRecord is null, the key was not found.
  if (!apikeyRecord || !apikeyRecord.hashed_key) {
    throw predefinedError('ApiKeyExpired'); // Or "InvalidCredentials"
  }

  // Compare the provided key with the stored full hash
  const isValid = await bcrypt.compare(providedKey, apikeyRecord.hashed_key);

  if (isValid) {
    return apikeyRecord.id;
  }

  throw predefinedError('ApiKeyExpired');
}

/**
 * Validates that the given login is actually a valid ApiKey by using a lookup hash
 *
 * @param providedKey - The raw API key to validate
 * @returns The ID of the validated key
 */
export async function validateLogin(username: string, password: string): Promise<any> {
  logger.trace('validateLogin');

  const user = await User.verifyCredentials(username, password);

  if (user) {
    return user;
  }

  throw predefinedError('InvalidCredentials');
}
