/**
 * Contains all the standard operations needed on the Shows table
 *
 * @module Shows Operations for the show table in the Arcade Finder DB
 * @version 1.3
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected March 24, 2025
 */
import { postgres } from '../connectors/index.js';
import { VALID_SHOW_FIELDS } from '../constants/validation/index.js';

interface IShow {
  id: number;
  name: string;
  year: number;
  link_imdb: string | null;
  link_justwatch: string | null;
  games?: any[];
}

class Show {
  // COUNT returns the total record count in the show table
  static async count(): Promise<number> {
    const { rows } = await postgres.query('SELECT COUNT(*) FROM show');
    return parseInt(rows[0].count, 10);
  }

  // EXISTS verifies if the record id is in the show table
  static async exists(id: number): Promise<boolean> {
    const { rows } = await postgres.query('SELECT 1 FROM show WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // EXISTS verifies if the record id is in the show table
  static async validateNameAndYear(id: number): Promise<boolean> {
    const { rows } = await postgres.query('SELECT 1 FROM show WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // CREATE new show
  static async create(newShow: Partial<IShow>): Promise<IShow> {
    if (!newShow?.name) {
      throw Object.assign(new Error("Show 'name' is required"), {
        httpStatusCode: 400,
      });
    }

    if (!newShow?.year) {
      throw Object.assign(new Error("Show 'year' is required"), {
        httpStatusCode: 400,
      });
    }

    const show = {
      name: newShow.name,
      year: newShow.year,
      link_imdb: newShow.link_imdb || null,
      link_justwatch: newShow.link_justwatch || null,
    };

    const { rows } = await postgres.query(
      'INSERT INTO show (name, year, link_imdb, link_justwatch) VALUES ($1, $2, $3, $4) RETURNING *',
      [show.name, show.year, show.link_imdb, show.link_justwatch],
    );

    return rows[0];
  }

  // READ all shows
  static async getAll(orderBy: string): Promise<IShow[]> {
    const safeOrderBy = orderBy.includes('.') ? orderBy : `s.${orderBy}`;
    const query = `
			SELECT 
				s.*,
				COALESCE(
					json_agg(
						json_build_object(
							'id', g.id,
							'name', g.name,
							'slug', g.slug,
							'igdb_id', g.igdb_id
						)
					) FILTER (WHERE g.id IS NOT NULL), '[]'::json
				) AS games
			FROM show s
			LEFT JOIN show_links sl ON s.id = sl.show_id
			LEFT JOIN game g ON sl.game_id = g.id
			GROUP BY s.id
			ORDER BY ${safeOrderBy}
		`;
    const { rows } = await postgres.query(query);
    return rows;
  }

  // READ Shows matching the id
  static async getById(id: number): Promise<IShow | null> {
    const query = `
			SELECT 
				s.*,
				COALESCE(
					json_agg(
						json_build_object(
							'id', g.id,
							'name', g.name,
							'slug', g.slug,
							'igdb_id', g.igdb_id
						)
					) FILTER (WHERE g.id IS NOT NULL), '[]'::json
				) AS games
			FROM show s
			LEFT JOIN show_links sl ON s.id = sl.show_id
			LEFT JOIN game g ON sl.game_id = g.id
			WHERE s.id = $1
			GROUP BY s.id
		`;
    const { rows } = await postgres.query(query, [id]);

    // Validate that the show id exists
    if (!rows.length) {
      throw Object.assign(new Error(`Shows does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    return rows[0] || null;
  }

  // UPDATE show by id with data
  // ChatGPT
  // https://chatgpt.com/c/67cf3b75-366c-8001-bf75-a51865b832f3
  static async update(id: number, data: Partial<IShow>): Promise<IShow | null> {
    // Validate data is passed in
    const keys = Object.keys(data);
    if (keys.length === 0) {
      throw Object.assign(new Error('No fields provided for update'), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Validate the keys being passed in
    const invalidKeys = keys.filter((key) => !VALID_SHOW_FIELDS.includes(key));
    if (invalidKeys.length > 0) {
      console.log('Invalid keys:', invalidKeys);
      throw Object.assign(new Error(`Invalid fields provided: ${invalidKeys}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Validate that the show id exists
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Shows does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Generate dynamic SET clause: "column1 = $1, column2 = $2, ..."
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    // Values array (ensures correct binding)
    const values = [...Object.values(data), id];

    const query = `UPDATE show SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    const { rows } = await postgres.query(query, values);
    return rows[0] || null;
  }

  // DELETE show by id
  static async delete(id: number): Promise<IShow | null> {
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Shows does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }
    const { rows } = await postgres.query('DELETE FROM show WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  }
}

export default Show;
