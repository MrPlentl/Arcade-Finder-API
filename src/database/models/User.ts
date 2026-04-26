/**
 * Contains all the standard operations needed on the User table
 *
 * @module User Operations for the user table in the Arcade Finder DB
 * @version 1.3
 * @author R. Brandon Plentl <bplentl@gmail.com>
 * @date_inspected March 21, 2025
 */
import { postgres } from '../connectors/index.js';
import { VALID_USER_FIELDS } from '../constants/validation/index.js';
import bcrypt from 'bcrypt';

// Interface for Custom Errors (replaces Object.assign logic)
interface HttpError extends Error {
  code?: number | string;
  httpStatusCode?: number;
}

export interface INewUser {
  username: string;
  email: string;
  password: string; // Plain text from the request body
}

export interface IUser {
  id: number;
  email: string;
  created_at: Date;
  uuid?: string;
  display_name?: string;
}

class User {
  // COUNT returns the total record count in the user table
  static async count(): Promise<number> {
    const { rows } = await postgres.query<{ count: string }>('SELECT COUNT(*) FROM user');
    return parseInt(rows[0].count, 10);
  }

  // EXISTS verifies if the record id is in the user table
  static async exists(id: number | string): Promise<boolean> {
    const { rows } = await postgres.query('SELECT 1 FROM user WHERE id = $1', [id]);
    return rows.length > 0;
  }

  /**
   * @TODO Usage seems identical to 'exists'. Logic name suggests validation but query checks ID.
   */
  static async validateNameAndYear(id: number | string): Promise<boolean> {
    const { rows } = await postgres.query('SELECT 1 FROM user WHERE id = $1', [id]);
    return rows.length > 0;
  }

  // CREATE new user
  static async create(newUser: INewUser): Promise<IUser> {
    console.log('Creating user with data:', newUser);

    // 1. Basic Validation
    if (!newUser.username || !newUser.email || !newUser.password) {
      const error = new Error('display_name, email, and password are required') as any;
      error.httpStatusCode = 400;
      throw error;
    }

    try {
      // 2. Hash the password before it touches the database
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);

      // 3. Insert into the database
      // Note: We return only the fields defined in IUser (omitting the password)
      const { rows } = await postgres.query<IUser>(
        `INSERT INTO users (display_name, email, password, created_by) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, display_name, email, created_at`,
        [
          newUser.username.toLowerCase(), // Normalize username
          newUser.email.toLowerCase(), // Normalize email
          hashedPassword,
          1,
        ],
      );
      console.log('rows:', rows);

      return rows[0];
    } catch (err: any) {
      console.log(err);
      // 4. Handle Duplicate Key Violations (Postgres Error Code 23505)
      if (err.code === '23505') {
        if (err.constraint === 'users_pkey') {
          throw new Error('Database sequence out of sync: Primary key already exists.');
        }

        const error = new Error('Username or Email already exists') as any;
        error.httpStatusCode = 409;
        throw error;
      }

      throw err; // Pass other DB errors up the chain
    }
  }

  static async findByUsernameOrEmail(username: string, email: string): Promise<IUser | undefined> {
    const query = `
      SELECT id, display_name, email 
      FROM users 
      WHERE display_name = $1 OR email = $2 
      LIMIT 1
    `;

    try {
      const { rows } = await postgres.query<IUser>(query, [
        username.toLowerCase(),
        email.toLowerCase(),
      ]);

      // Return the first match, or undefined if no user exists
      return rows[0] || undefined;
    } catch (err) {
      console.error('Database error in findByUsernameOrEmail:', err);
      throw err; // Let the controller handle the 500 error
    }
  }

  // VERIFY credentials
  static async verifyCredentials(username: string, password: string): Promise<IUser | null> {
    const { rows } = await postgres.query<any>(
      `SELECT * FROM users WHERE (display_name = $1 OR email = $1) AND is_suspended IS false`,
      [username.toLowerCase()],
    );

    if (!rows.length) return null;

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      delete user.password;
      return user;
    }

    return null;
  }

  // READ all users
  static async getAll(orderBy: string): Promise<IUser[]> {
    // SECURITY WARNING: Ensure 'orderBy' is validated before passing to SQL string to prevent injection
    const { rows } = await postgres.query<IUser>(`SELECT * FROM user ORDER BY ${orderBy}`);
    return rows;
  }

  // READ user matching the id
  static async getById(id: number | string): Promise<IUser | null> {
    const { rows } = await postgres.query<IUser>(`SELECT * FROM user WHERE id = $1`, [id]);

    // Validate that the user id exists
    if (!rows.length) {
      const error = new Error(`User does not exist with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    return rows[0] || null;
  }

  // READ user matching the apikey
  static async getByApikeyId(apikeyId: number | string): Promise<IUser | null> {
    console.log('getByApikeyId:', apikeyId);
    // Note: Query uses 'users' (plural), others use 'user' (singular). Check DB schema.
    const { rows } = await postgres.query<IUser>(
      `SELECT * FROM users WHERE apikey_id = $1 AND is_suspended IS false`,
      [apikeyId],
    );

    console.log('getByApikeyId rows:', rows);

    if (!rows.length) {
      const error = new Error(`User does not exist with the provided apikey!`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    return rows[0] || null;
  }

  // READ permissions
  static async getPermissionsById(id: number | string): Promise<string[]> {
    const { rows } = await postgres.query<{ name: string }>(
      `SELECT p.name
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = $1
        ORDER BY p.name ASC`,
      [id],
    );
    if (!rows.length) {
      // Logic note: A user might exist but have no permissions.
      // Throwing 400 here implies every user MUST have permissions.
      const error = new Error(`User does not exist with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    return rows.map((p) => p.name);
  }

  // READ roles
  static async getRolesById(id: number | string): Promise<string[]> {
    const { rows } = await postgres.query<{ name: string }>(
      `SELECT name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1
        ORDER BY ur.role_id`,
      [id],
    );

    if (!rows.length) {
      const error = new Error(`User does not have any roles with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    return rows.map((role) => role.name);
  }

  // UPDATE user by id with data
  static async update(id: number | string, data: Partial<IUser>): Promise<IUser | null> {
    const keys = Object.keys(data);

    if (keys.length === 0) {
      const error = new Error('No fields provided for update') as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    // Validate the keys being passed in
    const invalidKeys = keys.filter((key) => !VALID_USER_FIELDS.includes(key));

    if (invalidKeys.length > 0) {
      console.log('Invalid keys:', invalidKeys);
      const error = new Error(`Invalid fields provided: ${invalidKeys}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    // Validate that the user id exists
    if (!(await this.exists(id))) {
      const error = new Error(`User does not exist with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    // Generate dynamic SET clause
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    // Values array (ensures correct binding)
    const values = [...Object.values(data), id];

    // Ensure table name 'user' matches your schema
    const query = `UPDATE user SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

    const { rows } = await postgres.query<IUser>(query, values);
    return rows[0] || null;
  }

  // DELETE user by id
  static async delete(id: number | string): Promise<IUser | null> {
    if (!(await this.exists(id))) {
      const error = new Error(`User does not exist with id: ${id}`) as HttpError;
      error.code = 400;
      error.httpStatusCode = 400;
      throw error;
    }

    const { rows } = await postgres.query<IUser>('DELETE FROM user WHERE id = $1 RETURNING *', [
      id,
    ]);
    return rows[0] || null;
  }
}

export default User;
