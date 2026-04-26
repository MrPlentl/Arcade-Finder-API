/**
 * Contains all the standard operations needed on the Venue table
 *
 * @module Venue Operations for the venue table in the Arcade Finder DB
 * @version 1.1
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected April 13, 2025
 */
import { postgres } from '../connectors/index.js';
import { VALID_MOVIE_FIELDS } from '../constants/validation/index.js';

class Venue {
  // COUNT returns the total record count in the venue table
  static async count() {
    const { rows } = await postgres.query('SELECT COUNT(*) FROM venue');
    return parseInt(rows[0].count, 10);
  }

  // EXISTS verifies if the record id is in the venue table
  static async exists(id: any) {
    const { rows } = await postgres.query('SELECT 1 FROM venue WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // @TODO
  static async validateNameAndYear(id: any) {
    const { rows } = await postgres.query('SELECT 1 FROM venue WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // CREATE new venue
  static async create(newVenue: any) {
    if (!newVenue?.name) {
      throw Object.assign(new Error("Venue 'name' is required"), {
        httpStatusCode: 400,
      });
    }

    if (!newVenue?.year) {
      throw Object.assign(new Error("Venue 'year' is required"), {
        httpStatusCode: 400,
      });
    }

    const venue = {
      name: newVenue.name,
      year: newVenue.year,
      link_imdb: newVenue.link_imdb || null,
      link_letterboxd: newVenue.link_letterboxd || null,
      link_justwatch: newVenue.link_justwatch || null,
    };

    const { rows } = await postgres.query(
      'INSERT INTO venue (name, year, link_imdb, link_letterboxd, link_justwatch) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [venue.name, venue.year, venue.link_imdb, venue.link_letterboxd, venue.link_justwatch],
    );

    return rows[0];
  }

  // READ all venues
  // TODO: There is no limit on the return which will eventually return a ton of data.
  // This shouldn't be possible because defaults are set in the controller,
  // but it can be done inside the code
  static async getAll(sqlWhere: string | null = null, zipTableName = 'zipdistance05') {
    const where = sqlWhere ? `WHERE ${sqlWhere}` : '';

    const qry = `
      SELECT
        v.id,
        z.destination,
        z.distance,
        v.name,
        v.slug,
        v.verified,
        vt.name AS venue_type,
        vt.description AS venue_type_description,
        vs.name AS status,
        l.street,
        l.city,
        l.state,
        l.zip,
        l.coordinates,
        l.plus_code,
        l.parking_fee,
        pt.name AS parking_type,
        pt.description AS parking_description
      FROM ${zipTableName} AS z
      JOIN location AS l ON z.destination = l.zip
      JOIN venue AS v ON l.venue_id = v.id
      JOIN venue_type AS vt ON v.type = vt.id
      JOIN venue_status AS vs ON v.status = vs.id
      JOIN parking_type AS pt ON l.parking_type = pt.id
      ${where}
      ORDER BY z.distance;
    `;

    const { rows } = await postgres.query(qry);
    return rows;
  }

  // READ Venue matching the id or slug
  static async getByIdOrSlug(identifier: number | string, includes: string[] = []) {
    const isId = typeof identifier === 'number';
    const selectFields = isId
      ? ['v.*']
      : ['v.id', 'v.slug', 'v.name', 'v.verified', 'v.type', 'v.status'];

    // 1. Logic for "inventory" (Game ID and Game Name)
    if (includes.includes('inventory')) {
      selectFields.push(`(
				SELECT json_build_object(
					'total', COUNT(g.id),
					'items', COALESCE(json_agg(json_build_object(
						'id', g.id,
						'name', g.name,
							'slug', g.slug,
							'igdb_id', g.igdb_id
					)), '[]'::json)
				)
				FROM public.inventory i
				JOIN public.game g ON g.id = i.game_id
				WHERE i.venue_id = v.id
			) AS inventory`);
    }

    // 2. Logic for "location" (Extended Info)
    if (includes.includes('location')) {
      // Location details - using your location table structure
      selectFields.push(`(
				SELECT to_jsonb(l.*) - 'venue_id' 
				FROM public.location l 
				WHERE l.venue_id = v.id
			) AS location`);

      // Hours details
      selectFields.push(`(
				SELECT COALESCE(json_agg(json_build_object(
					'day', h.day, 
					'open', h.open, 
					'close', h.close
				)), '[]')
				FROM public.hours h 
				WHERE h.venue_id = v.id
			) AS hours`);

      // Menu and Pricing
      selectFields.push(`(
				SELECT COALESCE(json_agg(m.*), '[]') 
				FROM public.menu m 
				WHERE m.venue_id = v.id
			) AS menus`);

      selectFields.push(`(
				SELECT COALESCE(json_agg(p.*), '[]') 
				FROM public.pricing p 
				WHERE p.venue_id = v.id
			) AS pricing`);
    }

    const whereClause = isId ? 'v.id = $1' : 'v.slug = $1';
    const query = `
			SELECT ${selectFields.join(', ')}
			FROM public.venue v
			WHERE ${whereClause};
		`;

    const { rows } = await postgres.query(query, [identifier]);

    return rows[0];
  }

  // READ Venue matching the zip
  static async getByZip(zip: any) {
    const { rows } = await postgres.query(`SELECT * FROM venue WHERE zip = $1`, [zip]);

    // Validate that the venue id exists
    if (!rows.length) {
      throw Object.assign(new Error(`Venue does not exist with zip: ${zip}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    return rows[0] || null;
  }

  // UPDATE venue by id with data
  // ChatGPT
  // https://chatgpt.com/c/67cf3b75-366c-8001-bf75-a51865b832f3
  static async update(id: any, data: any) {
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

    // Validate that the venue id exists
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Venue does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Generate dynamic SET clause: "column1 = $1, column2 = $2, ..."
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    // Values array (ensures correct binding)
    const values = [...Object.values(data), id];

    const query = `UPDATE venue SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    const { rows } = await postgres.query(query, values);
    return rows[0] || null;
  }

  // DELETE venue by id
  static async delete(id: any) {
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Venue does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }
    const { rows } = await postgres.query('DELETE FROM venue WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  }
}

export default Venue;
