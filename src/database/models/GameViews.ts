/**
 * Contains all the standard operations needed on the Game Views table
 *
 * @module GameViews Operations for the game_views table in the Arcade Finder DB
 * @version 1.0
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected TBD
 */
import { postgres } from '../connectors/index.js';

class GameViews {
  // COUNT returns the total record count in the game_views table
  static async count() {
    const { rows } = await postgres.query('SELECT COUNT(*) FROM game_views');
    return parseInt(rows[0].count, 10);
  }

  // CREATE new game
  static async create(gameId: number): Promise<void> {
    if (!gameId) {
      throw Object.assign(new Error("game_views 'gameId' is required"), {
        httpStatusCode: 400,
      });
    }

    await postgres.query('INSERT INTO game_views (game_id) VALUES ($1)', [gameId]);
  }
  // READ all games
  static async getAll() {
    const { rows } = await postgres.query(
      `SELECT game_id, COUNT(game_id) AS total_views
        FROM game_views
        WHERE viewed_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY 
            game_id
        ORDER BY total_views DESC`,
    );
    return rows;
  }

  // READ Game matching the id
  static async getByGameId(id: number, range: string = '30 days') {
    const { rows } = await postgres.query(
      `SELECT 
            game_id, 
            COUNT(game_id) AS total_views
        FROM 
            game_views
        WHERE 
            game_id = $1 AND
            viewed_at >= CURRENT_DATE - INTERVAL $2
        GROUP BY 
            game_id
        ORDER BY total_views DESC`,
      [id, range],
    );
    return rows;
  }

  static async getPopularGames(range: string = '30 days', limit = 10) {
    const { rows } = await postgres.query(
      `SELECT game_id, COUNT(*) as view_count
        FROM game_views
        WHERE viewed_at >= CURRENT_DATE - INTERVAL $1
        GROUP BY game_id
        ORDER BY view_count DESC
       LIMIT $2`,
      [range, limit],
    );
    return rows;
  }

  static async cleanUpGameViews() {
    const { rows } = await postgres.query(
      `DELETE FROM game_views
        WHERE viewed_at < CURRENT_DATE - INTERVAL '90 days'
        RETURNING *`,
    );
    return rows;
  }
}

export default GameViews;
