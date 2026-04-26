import env from '../../../utils/environment.js';
import { sampleMiddleware } from '../middleware/index.js';

import pkg from 'pg';
const { Pool } = pkg;

// TESTING ENDPOINTS
const pong = async (req: any, res: any) => {
  console.log('[INDEX] WORKING PONG NEW!');

  const pool = new Pool({
    user: env.DB_USERNAME,
    host: env.DB_HOSTNAME,
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
    port: parseInt(env.DB_PORT || '5432'),
  });

  async function queryDatabase() {
    try {
      const res = await pool.query('SELECT * FROM venue');
      console.log(res.rows);
    } catch (err: any) {
      console.error(err);
    }
  }

  queryDatabase();

  return res.status(200).send('PING');
};

export default {
  pong: [sampleMiddleware, pong],
};
