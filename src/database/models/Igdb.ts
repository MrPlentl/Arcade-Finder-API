/**
 * Contains all the standard operations needed on the IGDB table
 *
 * @module Igdb Operations for the igdb table in the Arcade Finder DB
 * @version 1.1
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected Sept. 21, 2025
 */
import { postgres } from '../connectors/index.js';
import { VALID_IGDB_FIELDS } from '../constants/validation/index.js';

class Igdb {
  // COUNT returns the total record count in the igdb table
  static async count() {
    const { rows } = await postgres.query('SELECT COUNT(*) FROM igdb');
    return parseInt(rows[0].count, 10);
  }

  // EXISTS verifies if the record id is in the igdb table
  // Returns bool
  static async exists(id: number) {
    const { rows } = await postgres.query('SELECT 1 FROM igdb WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // CREATE new igdb
  static async create(newRecord: any) {
    // validate required fields
    if (!newRecord?.id) {
      throw Object.assign(new Error("igdb 'id' is required"), {
        httpStatusCode: 400,
      });
    }

    if (!newRecord?.name) {
      throw Object.assign(new Error("igdb 'name' is required"), {
        httpStatusCode: 400,
      });
    }

    const igdb = {
      id: newRecord.id,
      name: newRecord.name,
      slug: newRecord.slug || null,
      summary: newRecord.summary || null,
    };

    const { rows } = await postgres.query(
      'INSERT INTO igdb (id, name, slug, summary) VALUES ($1, $2, $3, $4) RETURNING *',
      [igdb.id, igdb.name, igdb.slug, igdb.summary],
    );

    return rows[0];
  }

  //// READ all igdbs
  static async getAll(orderBy = 'id') {
    const { rows } = await postgres.query(`SELECT * FROM igdb ORDER BY ${orderBy}`);
    return rows;
  }

  // READ igdb matching the id
  static async getById(id: number) {
    const { rows } = await postgres.query(`SELECT * FROM igdb WHERE id = $1`, [id]);

    // Validate that the igdb id exists
    if (!rows.length) {
      throw Object.assign(new Error(`Igdb does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    return rows[0] || null;
  }

  //// UPDATE igdb by id with data
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
    const invalidKeys = keys.filter((key) => !VALID_IGDB_FIELDS.includes(key));
    if (invalidKeys.length > 0) {
      console.log('Invalid keys:', invalidKeys);
      throw Object.assign(new Error(`Invalid fields provided: ${invalidKeys}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Validate that the igdb id exists
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Igdb does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }

    // Generate dynamic SET clause: "column1 = $1, column2 = $2, ..."
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    // Values array (ensures correct binding)
    const values = [...Object.values(data), id];

    const query = `UPDATE igdb SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    const { rows } = await postgres.query(query, values);
    return rows[0] || null;
  }

  //// DELETE igdb by id
  static async delete(id: number) {
    if (!(await this.exists(id))) {
      throw Object.assign(new Error(`Igdb does not exist with id: ${id}`), {
        code: 400,
        httpStatusCode: 400,
      });
    }
    const { rows } = await postgres.query('DELETE FROM igdb WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  }
}

export default Igdb;
