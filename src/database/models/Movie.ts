/**
 * Contains all the standard operations needed on the Movie table
 *
 * @module Movie Operations for the movie table in the Arcade Finder DB
 * @version 1.3
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected March 21, 2025
 */
import { postgres } from '../connectors/index.js';
import { VALID_MOVIE_FIELDS } from '../constants/validation/index.js';

interface IMovie {
  id: number;
  name: string;
  year: number;
  link_imdb: string | null;
  link_letterboxd: string | null;
  link_justwatch: string | null;
  games?: any[];
}

class Movie {
  // COUNT returns the total record count in the movie table
  static async count() {
    const { rows } = await postgres.query('SELECT COUNT(*) FROM movie');
    return parseInt(rows[0].count, 10);
  }

  // EXISTS verifies if the record id is in the movie table
  static async exists(id: number) {
    const { rows } = await postgres.query('SELECT 1 FROM movie WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // EXISTS verifies if the record id is in the movie table
  static async validateNameAndYear(id: number) {
    const { rows } = await postgres.query('SELECT 1 FROM movie WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // CREATE new movie
  static async create(newMovie: any) {
    if (!newMovie?.name) {
      throw Object.assign(new Error("Movie 'name' is required"), {
        httpStatusCode: 400,
      });
    }

    if (!newMovie?.year) {
      throw Object.assign(new Error("Movie 'year' is required"), {
        httpStatusCode: 400,
      });
    }

    const movie = {
      name: newMovie.name,
      year: newMovie.year,
      link_imdb: newMovie.link_imdb || null,
      link_letterboxd: newMovie.link_letterboxd || null,
      link_justwatch: newMovie.link_justwatch || null,
    };

    const { rows } = await postgres.query(
      'INSERT INTO movie (name, year, link_imdb, link_letterboxd, link_justwatch) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [movie.name, movie.year, movie.link_imdb, movie.link_letterboxd, movie.link_justwatch],
    );

    return rows[0];
  }

  // READ all movies
  static async getAll(orderBy: string): Promise<IMovie[]> {
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
			FROM movie s
			LEFT JOIN movie_links sl ON s.id = sl.movie_id
			LEFT JOIN game g ON sl.game_id = g.id
			GROUP BY s.id
			ORDER BY ${safeOrderBy}
		`;
    const { rows } = await postgres.query(query);
    return rows;
  }

  // READ Movies matching the id
  static async getById(id: number): Promise<IMovie | null> {
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
			FROM movie s
			LEFT JOIN movie_links sl ON s.id = sl.movie_id
			LEFT JOIN game g ON sl.game_id = g.id
			WHERE s.id = $1
			GROUP BY s.id
		`;
    const { rows } = await postgres.query(query, [id]);

    // Validate that the movie id exists
    if (!rows.length) {
      throw Object.assign(new Error(`Movies does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    return rows[0] || null;
  }

  // READ Movie matching the slug
  static async getBySlug(slug: string) {
    const { rows } = await postgres.query(`SELECT * FROM movie WHERE slug = $1`, [slug]);

    // Validate that the movie id exists
    if (!rows.length) {
      throw Object.assign(new Error(`Movie does not exist with slug: ${slug}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    return rows[0] || null;
  }

  // UPDATE movie by id with data
  // ChatGPT
  // https://chatgpt.com/c/67cf3b75-366c-8001-bf75-a51865b832f3
  static async update(id: number, data: any) {
    // Validate data is passed in
    const keys = Object.keys(data);
    if (keys.length === 0) {
      throw Object.assign(new Error('No fields provided for update'), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Validate the keys being passed in
    const invalidKeys = keys.filter((key) => !VALID_MOVIE_FIELDS.includes(key));
    if (invalidKeys.length > 0) {
      console.log('Invalid keys:', invalidKeys);
      throw Object.assign(new Error(`Invalid fields provided: ${invalidKeys}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Validate that the movie id exists
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Movie does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Generate dynamic SET clause: "column1 = $1, column2 = $2, ..."
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    // Values array (ensures correct binding)
    const values = [...Object.values(data), id];

    const query = `UPDATE movie SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    const { rows } = await postgres.query(query, values);
    return rows[0] || null;
  }

  // DELETE movie by id
  static async delete(id: number) {
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Movie does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }
    const { rows } = await postgres.query('DELETE FROM movie WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  }
}

export default Movie;
