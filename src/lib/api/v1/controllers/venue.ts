import { Request } from 'express';
import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[controller|venue]'); // Sets up the logger with the [app] string prefix
import { SqlErrorPayload, sqlError } from '../../utils/error.js';
import { attachIgdbImageInfo } from '../../utils/igdb.js';
import { Venue } from '../../../../database/models/index.js';

/**
 * FETCH a single Venue by slug or ID
 *
 * @param {*} req
 * @returns
 */
export async function fetchVenueById(req: Request) {
  logger.trace('fetchVenueById:', req?.params?.venueId);
  const useId = req.headers['x-use-id'] === 'true'; // Check if the x-use-id header is set to "true"
  const includeIgdb = req.headers['x-include-igdb'] === 'true'; // Check if the x-include-igdb header is set to "true"
  const includeQuery = req?.query?.include;

  // Process the include query parameter to get an array of fields to include
  let includes: string[] = [];
  if (includeQuery) {
    includes = (
      Array.isArray(includeQuery)
        ? includeQuery.map(String) // Ensure all items in array are strings
        : typeof includeQuery === 'string'
          ? [includeQuery]
          : []
    )
      .flatMap((item) => item.split(','))
      .filter(Boolean);
  }

  let response;
  try {
    const identifier = useId
      ? Number(req?.params?.venueId) || 1
      : (req?.params?.venueId as string) || '';
    response = await Venue.getByIdOrSlug(identifier, includes);

    if (includeIgdb && response?.inventory?.items) {
      await attachIgdbImageInfo(response?.inventory?.items, (msg) => {
        logger.warn(msg);
      });
    }

    if (!response) {
      response = { error: { message: `Venue not found with id: ${req?.params?.venueId}` } };
    }

    return response;
  } catch (error: unknown) {
    const msg =
      'An error occured while fetching the information on the venue. Please try again later and contact Support if the problem presists.';
    throw sqlError(error as SqlErrorPayload, msg);
  }
}

/**
 * FETCH All Venues
 *
 * @param {*} req
 * @returns
 */
export async function fetchAllVenues(req: Request) {
  logger.trace('fetchAllVenues:', req?.query?.sortBy);
  try {
    return await Venue.getAll();
  } catch (error: unknown) {
    logger.error('SQL Error in Venue.getAll:', (error as Error).message);
    const msg =
      'An error occured while fetching movies. Please try again later and contact Support if the problem presists.';
    throw sqlError(error as SqlErrorPayload, msg);
  }
}

/**
 * FETCH Venues using search params
 *
 * @param {*} req
 * @returns
 */
export async function fetchVenues(req: Request) {
  logger.trace('fetchVenues:', { ...req.query });
  const zip = (req?.query?.zip as string) || null;
  const distance = (req?.query?.distance as string) || '5';
  const name = (req?.query?.name as string) || null;

  try {
    if (!zip && !name) {
      console.log({ zip, distance, name });
      const err = new Error('Missing zipcode or name to search by') as any;
      err.httpStatusCode = 400;
      throw err;
    }

    const conditions = [];

    if (zip) {
      conditions.push(`z.origin = ${zip}`);
    }

    if (name) {
      conditions.push(`v.name ILIKE '${name}%'`);
    }

    if (distance) {
      conditions.push(`z.distance <= '${distance}'`);
    }

    const sqlWhere = conditions.length ? conditions.join(' AND ') : null;

    let tableName;
    if (parseInt(distance) > 50) {
      tableName = 'zipdistance100';
    } else if (parseInt(distance) > 25) {
      tableName = 'zipdistance50';
    } else if (parseInt(distance) > 5) {
      tableName = 'zipdistance25';
    } else {
      tableName = 'zipdistance05';
    }

    return await Venue.getAll(sqlWhere, tableName);
  } catch (error: unknown) {
    logger.error('SQL Error in Venue.getAll:', (error as Error).message);
    const msg =
      'An error occured while fetching venues. Please try again later and contact Support if the problem presists.';
    throw sqlError(error as SqlErrorPayload, msg);
  }
}
