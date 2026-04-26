// services/igdb/middleware.js
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      igdbToken?: string;
    }
  }
}

let tokenCache = {
  access_token: null,
  expires_at: 0,
};

/**
 * Middleware to check cached IGDB access token or fetch a new one
 */
export async function checkAccessToken(req: Request, res: Response, next: NextFunction) {
  try {
    const now = Date.now();

    if (tokenCache.access_token && tokenCache.expires_at > now) {
      // Token is still valid, attach to request
      req.igdbToken = tokenCache.access_token;
      return next();
    }

    // Token expired or missing → fetch a new one
    const token = await getIgdbAccessToken();
    tokenCache.access_token = token.token;
    tokenCache.expires_at = token.expires_at;

    req.igdbToken = token.token;
    next();
  } catch (err) {
    console.error('IGDB Middleware error:', err);
    res.status(500).json({ error: 'Failed to authenticate with IGDB' });
  }
}

/**
 * Fetch a new IGDB access token from Twitch OAuth
 */
async function getIgdbAccessToken() {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET in environment variables');
  }

  const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  const response = await fetch(url, { method: 'POST' });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return {
    token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000, // store exact expiry timestamp
  };
}
