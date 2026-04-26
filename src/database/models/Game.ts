/**
 * Contains all the standard operations needed on the Game table
 *
 * @module Game Operations for the game table in the Arcade Finder DB
 * @version 1.1
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected TBD
 */
import { postgres } from '../connectors/index.js';
import { VALID_GAME_FIELDS } from '../constants/validation/index.js';

interface NewGame {
  name: string;
  type: number;
  igdb_id?: number | null;
  updated_by?: number | null;
  created_by?: number | null;
}

class Game {
  // COUNT returns the total record count in the game table
  static async count() {
    const { rows } = await postgres.query('SELECT COUNT(*) FROM game');
    return parseInt(rows[0].count, 10);
  }

  // EXISTS verifies if the record id is in the game table
  static async exists(id: number) {
    const { rows } = await postgres.query('SELECT 1 FROM game WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // EXISTS verifies if the record id is in the game table
  static async validateNameAndYear(id: number) {
    const { rows } = await postgres.query('SELECT 1 FROM game WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // CREATE new game
  static async create(newGame: NewGame) {
    if (!newGame?.name) {
      throw Object.assign(new Error("game 'name' is required"), {
        httpStatusCode: 400,
      });
    }

    if (!newGame?.type) {
      throw Object.assign(new Error("game 'type' is required"), {
        httpStatusCode: 400,
      });
    }

    const game = {
      name: newGame.name,
      type: newGame.type,
      igdb_id: newGame.igdb_id || null,
      updated_by: newGame.updated_by || null,
      created_by: newGame.created_by || null,
    };

    const { rows } = await postgres.query(
      'INSERT INTO game (name, type, igdb_id, updated_by, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [game.name, game.type, game.igdb_id, game.updated_by, game.created_by],
    );

    return rows[0];
  }

  // READ all games missing an Igdb id

  // @TODO: Remove LIMIT 5 after testing
  static async getAllGamesMissingIgdbId() {
    const { rows } = await postgres.query(
      `SELECT * FROM game WHERE type > 1 AND type < 8 AND igdb_id IS NULL ORDER BY id LIMIT 100`,
    );
    return rows;
  }

  // READ all games
  static async getAll(orderBy = 'id') {
    const { rows } = await postgres.query(`SELECT * FROM game ORDER BY ${orderBy}`);
    return rows;
  }

  // READ Game matching the id
  static async getById(id: number) {
    const { rows } = await postgres.query(
      `SELECT g.*, 
					i.name AS igdb_name, 
					i.summary AS igdb_summary,
					t.name AS game_type,
					t.description AS game_type_description,
					(
						SELECT COALESCE(
							json_agg(
								json_build_object(
									'id', m.id,
									'name', m.name,
									'year', m.year
								)
							), '[]'::json
						)
						FROM movie m
						JOIN movie_links ml ON m.id = ml.movie_id
						WHERE ml.game_id = g.id
					) AS movies,
					(
						SELECT COALESCE(
							json_agg(
								json_build_object(
									'id', s.id,
									'name', s.name,
									'year', s.year
								)
							), '[]'::json
						)
						FROM show s
						JOIN show_links sl ON s.id = sl.show_id
						WHERE sl.game_id = g.id
					) AS shows
			 FROM game g 
			 LEFT JOIN igdb i ON g.igdb_id = i.id 
			 LEFT JOIN game_type t ON g.type = t.id 
			 WHERE g.id = $1`,
      [id],
    );

    // Validate that the game id exists
    if (!rows.length) {
      throw Object.assign(new Error(`Game does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    return rows[0] || null;
  }

  // READ Game matching the id
  static async getBySlug(slug: string) {
    const { rows } = await postgres.query(
      `SELECT g.*, 
					i.name AS igdb_name, 
					i.summary AS igdb_summary,
					t.name AS game_type,
					t.description AS game_type_description,
					(
						SELECT COALESCE(
							json_agg(
								json_build_object(
									'id', m.id,
									'name', m.name,
									'slug', m.slug,
									'year', m.year,
									'link_imdb', m.link_imdb,
									'link_justwatch', m.link_justwatch,
									'link_letterboxd', m.link_letterboxd
								)
							), '[]'::json
						)
						FROM movie m
						JOIN movie_links ml ON m.id = ml.movie_id
						WHERE ml.game_id = g.id
					) AS movies,
					(
						SELECT COALESCE(
							json_agg(
								json_build_object(
									'id', s.id,
									'name', s.name,
									'slug', s.slug,
									'year', s.year,
									'link_imdb', s.link_imdb,
									'link_justwatch', s.link_justwatch
								)
							), '[]'::json
						)
						FROM show s
						JOIN show_links sl ON s.id = sl.show_id
						WHERE sl.game_id = g.id
					) AS shows
			 FROM game g 
			 LEFT JOIN igdb i ON g.igdb_id = i.id 
			 LEFT JOIN game_type t ON g.type = t.id 
			 WHERE g.slug = $1`,
      [slug],
    );

    // Validate that the game id exists
    if (!rows.length) {
      throw Object.assign(new Error(`Game does not exist with slug: ${slug}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    return rows[0] || null;
  }

  // UPDATE game by id with data
  static async update(id: number, data: any) {
    const keys = Object.keys(data);

    // 1. Strict Whitelist (Exclude fields like 'id', 'created_at', etc.)
    const EDITABLE_FIELDS = ['name', 'slug', 'summary', 'release_date'];

    if (keys.length === 0) {
      throw Object.assign(new Error('No fields provided'), { code: 400 });
    }

    const invalidKeys = keys.filter((key) => !EDITABLE_FIELDS.includes(key));
    if (invalidKeys.length > 0) {
      throw Object.assign(new Error(`Unauthorized fields: ${invalidKeys}`), { code: 400 });
    }

    // 2. Build Query
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const values = [...Object.values(data), id];

    // We use the ID at the last position ($keys.length + 1)
    const query = `
			UPDATE game 
			SET ${setClause} 
			WHERE id = $${keys.length + 1} 
			RETURNING *`;

    // 3. Execute and Check Result in one go
    const { rows } = await postgres.query(query, values);

    if (rows.length === 0) {
      throw Object.assign(new Error(`Game not found`), { code: 404 });
    }

    return rows[0];
  }

  // DELETE game by id
  static async delete(id: number) {
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Game does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }
    const { rows } = await postgres.query('DELETE FROM game WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  }

  // SEARCH for games that match the search term in the name or game_aliases table
  static async search(search: string, orderBy = 'name') {
    if (!search || !search.trim()) {
      throw Object.assign(new Error(`Search term is required`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    const allowedOrderColumns = ['name', 'id', 'igdb_id'];
    const safeOrderBy = allowedOrderColumns.includes(orderBy) ? orderBy : 'name';

    // Block long search terms and escape special characters to prevent SQL injection and ensure efficient querying
    const cleanSearch = search.trim().slice(0, 15);
    const escapedSearch = cleanSearch.replace(/[\\%_]/g, '\\$&');

    const query = `
			SELECT DISTINCT g.id, g.name, g.slug, g.igdb_id 
			FROM game g
			LEFT JOIN game_aliases ga ON g.id = ga.game_id
			WHERE g.name ILIKE $1 ESCAPE '\\'
				OR ga.name_variant ILIKE $1 ESCAPE '\\'
			ORDER BY g.${safeOrderBy}
		`;

    const { rows } = await postgres.query(query, [`${escapedSearch}%`]);
    return rows;
  }
}

export default Game;
