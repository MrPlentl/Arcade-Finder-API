// import env from "../../../utils/environment.js";
import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[controller|movie]'); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from '../../utils/error.js';

/**
 * CREATE a new Movie
 *
 * @param {*} req
 * @returns
 */
export async function getTest(req: any): Promise<[number, string]> {
  logger.trace('getTest: Controller');
  return [200, 'It Works'];
}
