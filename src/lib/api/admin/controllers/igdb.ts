import { log4js } from '../../../../utils/log4js.js';
const logger = log4js.getLogger('[admin|controller|igdb]'); // Sets up the logger with the [app] string prefix
import { formatErrorResponse, sqlError } from '../../utils/error.js';
import { searchGameByName } from '../../../../services/igdb/controller.js';

// Games
import { Game, Igdb } from '../../../../database/models/index.js';

export async function findMismatchedGames(req: any): Promise<[number, any]> {
  logger.trace('findMismatchedGames');
  // Connect to DB table `games` and find the games missing an IGDB ID

  // Get the list of games missing IGDB IDs
  const games = await Game.getAllGamesMissingIgdbId();

  // Foreach game, search IGDB
  try {
    const results = [];

    for (const [index, game] of games.entries()) {
      const response = await searchGameByName(game.name, [52], 15); // 52 is the platform id for Arcade in IGDB. This will help narrow down the search results and improve accuracy.
      if (response && response.length > 0) {
        logger.debug('Found IGDB match for game:', game.name);
        logger.debug('Response:', response);

        let matchIndex = response.findIndex(
          (r: any) => r.name?.toLowerCase() === game.name?.toLowerCase(),
        );
        logger.debug('matchIndex:', matchIndex);
        if (matchIndex === -1) {
          matchIndex = 0;
        }

        const matchedGame = response[matchIndex];

        logger.debug('Update Game:', game);
        logger.debug('IGDB_ID:', matchedGame.id);

        const updateGame = {
          igdb_id: matchedGame.id,
          updated_by: 1,
        };

        const row = await Game.update(game.id, updateGame);
        logger.debug(row);

        // Add new record to IGDB table if it doesn't exist
        if (matchedGame.id && !(await Igdb.exists(matchedGame.id))) {
          const newIgdb = {
            id: matchedGame.id,
            name: matchedGame.name,
            slug: matchedGame.slug,
            summary: matchedGame.summary,
          };
          await Igdb.create(newIgdb);
        }
      }
      if (response && response.length > 0) {
        results.push(response);
      }

      // Sleep for 1 second every 4 loops
      if ((index + 1) % 4 === 0) {
        logger.debug('Resting...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    const response = results;
    return [200, response];
  } catch (error: any) {
    logger.error('SQL Error in findMismatchedGames:', error.message);
    error.httpStatusCode = 400;
    let msg =
      'An error occured while finding mismatched games. Check the details and please try again. Contact Support if the problem presists.';
    if (error.code == 23505) {
      msg =
        'Duplicate IGDB record Detected: A IGDB record already exists with that id. Check the details and please try again. Contact Support if the problem presists.';
    }
    return formatErrorResponse(sqlError(error, msg));
  }
}
