import { Request, Response } from 'express';
import { PERMISSIONS } from '../../utils/constants.js';
import * as auth from '../middleware/auth.js';
import { setStdRespHeaders } from '../middleware/index.js';
import * as controller from '../controllers/game.js';
import { standardResponse } from '../../utils/helpers.js';
import { log4js } from '../../../../utils/log4js.js';

const logger = log4js.getLogger('[routes|game]'); // Sets up the logger with the [app] string prefix

////////////////////////
// READ
/**
 * Returns a complete list of games that are based on Video Games
 *
 * GET /games
 * @param {*} req
 * @param {*} res
 * @returns
 */

const getGames = async (req: Request, res: Response): Promise<Response> => {
  logger.trace('getGames');
  const response = await controller.fetchAllGames(req);
  return res.status(200).send(standardResponse(response));
};

/**
 * Returns the information on a single Game based on the given video game
 *
 * GET /game/{game_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getGameById = async (req: Request, res: Response): Promise<Response> => {
  logger.trace('getGameById:', req?.params?.gameId);
  const response = await controller.fetchGameById(req);
  return res.status(200).send(standardResponse(response, false));
};

////////////////////////
// ADMIN ROUTES

////////////////////////
// CREATE
/**
 * Returns the information on a single Game based on the given video game
 *
 * GET /game/{game_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const createGame = async (req: Request, res: Response) => {
  logger.trace('createGame:', req?.params?.gameId);
  const response = await controller.createNewGame(req);
  return res.status(201).send(standardResponse(response, false));
};

////////////////////////
// UPDATE
/**
 * Returns the information on a single Game based on the given video game
 *
 * GET /game/{game_id}
 * @param {*} req
 * @param {*} res
 * @returns
 */
const updateGameInfo = async (req: Request, res: Response) => {
  logger.trace('updateGameInfo:', req?.params?.gameId);
  const response = await controller.updateGameById(req);
  return res.status(200).send(standardResponse(response, false));
};

////////////////////////
// DELETE
// @TODO: Need to refactor
const deleteGame = async (req: Request, res: Response) => {
  logger.trace('deleteGame:', req?.params?.gameId);
  const [statusCode, response] = await controller.deleteGameById(req);

  if (statusCode === 204) {
    return res.status(statusCode as number).send();
  }

  return res.status(statusCode as number).send(JSON.stringify(response));
};

/**
 * @TODO: This is a test route that should be removed before production.
 *        It is used to test the response format and the controller function for fetching all games.
 *
 * Returns a complete list of games that are based on Video Games
 *
 * GET /games
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getGamesTest = async (req: Request, res: Response) => {
  logger.trace('getGamesTest');
  const statusCode = 200;
  const response = { message: 'This is a test response for fetching all games.' };
  const responseJSON = [
    {
      title: 'Adventure',
      year: 1980,
      description:
        'Players control a square avatar to explore a kingdom, find a chalice, and avoid dragons in this pioneering action-adventure game.',
      image: 'Adventure.png',
    },
    {
      title: 'Asteroids',
      year: 1979,
      description:
        'A multidirectional shooter where the player pilots a spaceship to destroy asteroids and saucers while avoiding collisions.',
      image: 'Asteroids.png',
    },
    {
      title: 'Battlezone',
      year: 1980,
      description:
        'A first-person tank combat game that simulates a battlefield using 3D vector graphics.',
      image: 'Battle_Zone.png',
    },
    {
      title: 'Berzerk',
      year: 1980,
      description:
        'A maze shooter where the player must escape rooms filled with armed robots and a bouncing smiley face named Evil Otto.',
      image: 'Berkerk.png',
    },
    {
      title: 'Fortnite',
      year: 2017,
      description:
        'A massive battle royale game where players build structures and fight to be the last one standing.',
      image: 'Fortnite.png',
    },
    {
      title: 'Frogger',
      year: 1981,
      description:
        'The player guides frogs to their homes by crossing a busy highway and a hazardous river.',
      image: 'Frogger.png',
    },
    {
      title: 'Galaxian',
      year: 1979,
      description:
        'A fixed shooter where the player defends against waves of descending alien ships that attack in kamikaze-like formations.',
      image: 'Galaxian.png',
    },
    {
      title: 'Halo: Combat Evolved',
      year: 2001,
      description:
        'A sci-fi first-person shooter following the Master Chief as he battles the Covenant on a mysterious ringworld.',
      image: 'Halo.png',
    },
    {
      title: 'Lunar Lander',
      year: 1979,
      description:
        'A vector-based simulation game where the player must carefully pilot a lunar module to a safe landing on the moon.',
      image: 'LunarLander.png',
    },
    {
      title: 'Missile Command',
      year: 1980,
      description:
        'Players defend six cities from endless waves of ballistic missiles by launching counter-missiles.',
      image: 'MissleCommand.png',
    },
    {
      title: 'Moon Cresta',
      year: 1980,
      description:
        'A vertical shooter where the player controls a ship that can dock with other parts to upgrade its firepower.',
      image: 'MoonCresta.png',
    },
    {
      title: 'Pac-Man',
      year: 1980,
      description:
        'The player navigates a maze to eat all the dots while avoiding four colorful ghosts.',
      image: 'Pac-Man.png',
    },
    {
      title: 'Pole Position II',
      year: 1983,
      description:
        'A racing game sequel that features four different race tracks and improved graphics over the original.',
      image: 'Pole-Position-2.png',
    },
    {
      title: 'Pong',
      year: 1972,
      description:
        'One of the earliest arcade video games, featuring simple two-dimensional tennis gameplay.',
      image: 'Pong.png',
    },
    {
      title: 'Space Invaders',
      year: 1978,
      description:
        'A fixed shooter where the player controls a laser cannon to defeat descending waves of aliens.',
      image: 'SpaceInvaders.png',
    },
    {
      title: 'Star Castle',
      year: 1980,
      description:
        'A vector shooter where the player must destroy a central cannon protected by three rotating energy rings.',
      image: 'StarCastle.png',
    },
    {
      title: 'Street Fighter II',
      year: 1991,
      description:
        'A competitive fighting game that popularized the genre with its unique character roster and combo system.',
      image: 'Street-fighter-2.png',
    },
    {
      title: 'Street Fighter III',
      year: 1997,
      description:
        'A technical fighting game known for its fluid animation and the introduction of the parry mechanic.',
      image: 'Street-Fighter-3.png',
    },
    {
      title: 'Super Breakout',
      year: 1978,
      description:
        'An action game where the player uses a paddle to bounce a ball and destroy layers of bricks.',
      image: 'SuperBreakout.png',
    },
    {
      title: 'Tempest',
      year: 1981,
      description:
        'A tube shooter where the player moves along the edge of a 3D web to destroy enemies climbing up from the depths.',
      image: 'Tempest.png',
    },
    {
      title: 'Warlords',
      year: 1980,
      description:
        'A competitive action game where four players defend their castles from a bouncing fireball.',
      image: 'Warlords.png',
    },
  ];
  return res.status(statusCode as number).send(responseJSON);
};

export default {
  getGames: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.READ),
    getGames,
  ],
  getGameById: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.READ),
    getGameById,
  ],
  createGame: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.GAME.CREATE),
    createGame,
  ],
  updateGameInfo: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.GAME.UPDATE),
    updateGameInfo,
  ],
  deleteGame: [
    setStdRespHeaders,
    auth.authenticateToken,
    auth.hasRequiredPermission(PERMISSIONS.GAME.DELETE),
    deleteGame,
  ],
  getGamesTest: [setStdRespHeaders, getGamesTest],
};
