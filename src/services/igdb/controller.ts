import axios from 'axios';

import { igdbApikeyCache } from '../../utils/lruCache.js';
import { log4js } from '../../utils/log4js.js';
const logger = log4js.getLogger('[services|igdb|controller]'); // Sets up the logger with the [app] string prefix

import { getIgdbAuthUrl, getIgdbBaseUrl } from './urls.js';

/**
 * Get IGDB access token, using cache if available.
 * Can be called from any controller/service.
 * @returns {Promise<string>} access_token
 */
export async function getIgdbAccessToken() {
  logger.info('===== getIgdbAccessToken =====');
  if (igdbApikeyCache.get('apiKey')) {
    logger.trace('igdbApikeyCache FOUND!');
    return igdbApikeyCache.get('apiKey');
  }

  // Fetch new token from Twitch
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET in environment variables');
  }

  const authUrl = getIgdbAuthUrl(clientId, clientSecret);

  const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  const response = await fetch(url, { method: 'POST' });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  igdbApikeyCache.set('apiKey', data.access_token);
  logger.trace('igdbApikeyCache SET!');
  return data.access_token;
}

export async function searchGameByName(gameName: string, platforms: number[] = [], limit = 1) {
  logger.info('searchGameByName:', { gameName, platforms, limit });
  const IGDB_API_URL = `${getIgdbBaseUrl()}/games`;
  const igdbAccessToken = await getIgdbAccessToken();
  logger.debug('igdbAccessToken:', igdbAccessToken);

  const cleanGameName = gameName.replace(/[^a-zA-Z0-9 ]/g, '');

  let query = `
		search "${cleanGameName}";
		fields name, genres, platforms, release_dates, first_release_date, summary, slug;
		limit ${limit};
	`;

  if (platforms.length > 0) {
    query += `\nwhere platforms = (${platforms.join(',')});`;
  }

  // Removed: "Content-Type": "application/x-www-form-urlencoded",
  try {
    const response = await axios.post(IGDB_API_URL, query, {
      headers: {
        Accept: 'application/json',
        'Client-ID': process.env.IGDB_CLIENT_ID, // replace with your actual client id
        Authorization: `Bearer ${igdbAccessToken}`, // replace with your actual token
        'Content-Type': 'text/plain',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('IGDB request failed:', error.response?.data || error.message);
    throw error;
  }
}
