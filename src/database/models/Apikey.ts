/**
 * Contains all the standard operations needed on the Apikey table
 *
 * @module Apikey Operations for the game table in the Arcade Finder DB
 * @version 1.1
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected TBD
 */
import { postgres } from '../connectors/index.js';

// 1. Define the shape of a row in the 'apikey' table
export interface IApikey {
  id: number | string; // Supports Serial ID (number) or UUID (string)
  lookup_hash: string;
  hashed_key: string;
  expires_at?: Date; // Optional because it might be null in DB
  created_at?: Date; // Assuming you might have timestamps
  updated_at?: Date;
}

// 2. Define what is required to create a new key
export interface INewApikey {
  lookup_hash: string;
  hashed_key: string;
}

class Apikey {
  // CREATE
  /**
   * Creates a new API key record
   * @param newApiKey - The data object containing hash and key
   * @returns The created record
   */
  static async create(newApiKey: INewApikey): Promise<IApikey> {
    // Optional: TypeScript handles this static check, but runtime validation is still good practice
    if (!newApiKey?.lookup_hash) {
      throw new Error("Api 'lookup_hash' is required");
    }

    if (!newApiKey?.hashed_key) {
      throw new Error("Api 'hashed_key' is required");
    }

    // Pass <IApikey> to .query so 'rows' is typed correctly
    const { rows } = await postgres.query<IApikey>(
      'INSERT INTO apikey (lookup_hash, hashed_key) VALUES ($1, $2) RETURNING *',
      [newApiKey.lookup_hash, newApiKey.hashed_key],
    );

    return rows[0];
  }

  // READ

  /**
   * Returns Apikey matching the id
   * @param id - The ID of the key
   */
  static async getById(id: number | string): Promise<IApikey | null> {
    const { rows } = await postgres.query<IApikey>(`SELECT * FROM apikey WHERE id = $1`, [id]);

    return rows[0] || null;
  }

  /**
   * Returns specific fields for the Apikey matching the lookup hash
   * @param lookupHash - The public lookup hash
   */
  static async getByLookupHash(lookupHash: string): Promise<Partial<IApikey> | null> {
    // Note: Query selects specific columns, so we return Partial<IApikey>
    const { rows } = await postgres.query<IApikey>(
      `SELECT id, hashed_key, expires_at FROM apikey WHERE lookup_hash = $1`,
      [lookupHash],
    );

    return rows[0] || null;
  }

  /*
   * -------------------------------------------------------
   * FUTURE IMPLEMENTATIONS (Migrated to TS format below)
   * -------------------------------------------------------
   */

  // static async getAll(orderBy: string): Promise<IApikey[]> {
  //   // logger.trace("getAll:", orderBy);
  //   try {
  //     const { rows } = await postgres.query<IApikey>(`SELECT * FROM apikey ORDER BY ${orderBy}`);
  //     return rows;
  //   } catch (error: any) {
  //     // logger.error("SQL Error in getAll:", error);
  //     throw new Error(`An error occurred while fetching keys.`);
  //   }
  // }

  // static async update(id: number | string, data: Partial<IApikey>): Promise<IApikey | null> {
  //   // logger.trace("update:", id);
  //   try {
  //     const keys = Object.keys(data);
  //     if (keys.length === 0) {
  //       throw new Error("No fields provided for update");
  //     }
  //
  //     // Generate dynamic SET clause
  //     const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
  //     const values = [...Object.values(data), id];
  //
  //     const query = `UPDATE apikey SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
  //
  //     const { rows } = await postgres.query<IApikey>(query, values);
  //     return rows[0] || null;
  //   } catch (error) {
  //     console.error("Error updating apikey:", error);
  //     throw error;
  //   }
  // }

  // static async delete(id: number | string): Promise<IApikey | null> {
  //   // logger.trace("delete:", id);
  //   try {
  //     const { rows } = await postgres.query<IApikey>("DELETE FROM apikey WHERE id = $1 RETURNING *", [id]);
  //     return rows[0] || null;
  //   } catch (error) {
  //     console.error("Error Deleting apikey:", error);
  //     throw error;
  //   }
  // }
}

export default Apikey;
