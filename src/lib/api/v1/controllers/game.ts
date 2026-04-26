import { Request } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { formatErrorResponse, sqlError } from '../../utils/error.js';
import { Game } from '../../../../database/models/index.js';
import GameViews from '../../../../database/models/GameViews.js';
import { log4js } from '../../../../utils/log4js.js';

const logger = log4js.getLogger('[controller|game]'); // Sets up the logger with the [app] string prefix

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const IGDB_STORAGE_DIR = join(__dirname, '../../../../../storage/igdb');

/**
 * Helper to attach IGDB info to a game object
 * @TODO: This needs to be moved out of the controller and into a service or utility file. It is not the responsibility of the controller to handle this logic.
 */
async function attachIgdbInfo(game: any) {
  if (game && game.igdb_id) {
    const igdbIdStr = String(game.igdb_id);
    const folder = igdbIdStr.padStart(2, '0').slice(-2);
    const filePath = join(IGDB_STORAGE_DIR, folder, `${igdbIdStr}.json`);
    try {
      const fileData = await readFile(filePath, 'utf-8');
      game.igdb = JSON.parse(fileData);
    } catch (error: any) {
      logger.warn(`Failed to read IGDB file for ID ${igdbIdStr}: ${error.message}`);
    }
  }
  return game;
}

/**
 * FETCH All Games
 *
 * @param {*} req
 * @returns
 */
export async function fetchAllGames(req: Request) {
  logger.trace('fetchAllGames:', req?.query?.sortBy);
  const orderBy = (req?.query?.sortBy as string) || 'id'; // Check if the sortBy parameter was set. default: "id"
  const search = (req?.query?.search as string) || null; // Check if the search parameter was set. default: "id"
  try {
    if (search) {
      let response = await Game.search(search, orderBy);

      const searchLower = search.toLowerCase();
      response.sort((a, b) => {
        const aExact = (a.name || '').toLowerCase() === searchLower;
        const bExact = (b.name || '').toLowerCase() === searchLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });

      return (response = await Promise.all(response.map(attachIgdbInfo)));
    } else {
      return await Game.getAll(orderBy);
    }
  } catch (error: any) {
    logger.error('SQL Error in Game.getAll:', error.message);
    const msg =
      'An error occured while fetching games. Please try again later and contact Support if the problem presists.';
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * FETCH Game by Id
 *
 * @param {*} req
 * @returns
 */
export async function fetchGameById(req: Request) {
  logger.trace('fetchGameById:', req?.params?.gameId);
  // @TODO: Add validation to ensure that gameId is a number and handle cases where it is not.
  // Also, I need to validate the user has permissions to use the ID
  const useId = req.headers['x-use-id'] === 'true'; // Check if the x-use-id header is set to "true"
  const includeIgdb = req.headers['x-include-igdb'] === 'true'; // Check if the x-include-igdb header is set to "true"

  let response;
  try {
    if (useId) {
      const id: number = Number(req?.params?.gameId) || 99;
      response = await Game.getById(id);
    } else {
      const slug: string = (req?.params?.gameId as string) || '';
      response = await Game.getBySlug(slug);
    }
    if (includeIgdb) {
      response = await attachIgdbInfo(response);
    }
    if (response) {
      GameViews.create(response.id);
    }

    return response;
  } catch (error: any) {
    logger.error('SQL Error in Game.getById:', error.message);
    const msg = `An error occured while fetching the game with id: ${req?.params?.gameId}. Please try again later and contact Support if the problem presists.`;
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * CREATE a new Game
 *
 * @param {*} req
 * @returns
 */
export async function createNewGame(req: Request) {
  logger.trace('createNewGame:', req?.body?.name);
  const data = req?.body;
  // VALIDATE DATA HERE
  try {
    const response = (await Game.create(data)) || {};
    return [200, response];
  } catch (error: any) {
    logger.error('SQL Error in Game.create:', error.message);
    error.httpStatusCode = 400;
    let msg =
      'An error occured while creating a new Game. Check the details and please try again. Contact Support if the problem presists.';
    if (error.code == 23505) {
      msg =
        'Duplicate Game Detected: A game already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.';
    }
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * UPDATE Game
 *
 * @param {*} req
 * @returns
 */
export async function updateGameById(req: Request) {
  logger.trace('updateGameById:', req?.params?.gameId);
  const id: number = Number(req?.params?.gameId) || 99;
  const data = req?.body;

  try {
    const response = (await Game.update(id, data)) || {};
    return response;
  } catch (error: any) {
    logger.error('SQL Error in Game.update:', error.message);
    error.httpStatusCode = 400;
    let msg =
      'An error occured while creating a new Game. Check the details and please try again. Contact Support if the problem presists.';
    if (error.code == 23505) {
      msg =
        'Duplicate Game Detected: A game already exists with that name and year. Check the details and please try again. Contact Support if the problem presists.';
    }
    return formatErrorResponse(sqlError(error, msg));
  }
}

/**
 * DELETE Game
 *
 * @param {*} req
 * @returns
 */
export async function deleteGameById(req: Request) {
  logger.trace('deleteGameById:', req?.params?.gameId);
  try {
    const id: number = Number(req?.params?.gameId);
    const response = await Game.delete(id);
    return [204, response];
  } catch (error: any) {
    logger.error('SQL Error in Game.delete:', error.message);
    error.httpStatusCode = 404;
    const msg = 'Error Deleting game';
    return formatErrorResponse(sqlError(error, msg));
  }
}
