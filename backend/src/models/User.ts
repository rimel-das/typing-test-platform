import pool from "../config/database";
import { hashPassword, verifyPassword } from "../utils/password";

/**
 * User Model/Service
 * Handles all user-related database operations
 */

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
  email_verified: boolean;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

/**
 * Create new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const { username, email, password } = input;

  // Check if user already exists
  const existing = await pool.query(
    "SELECT id FROM users WHERE username = $1 OR email = $2",
    [username, email],
  );

  if (existing.rows.length > 0) {
    throw new Error("Username or email already exists");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [username, email, passwordHash],
  );

  return result.rows[0];
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

/**
 * Find user by username
 */
export async function findUserByUsername(
  username: string,
): Promise<User | null> {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0] || null;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
}

/**
 * Validate user credentials
 */
export async function validateCredentials(
  username: string,
  password: string,
): Promise<User | null> {
  const user = await findUserByUsername(username);

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  return isValid ? user : null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  id: string,
  updates: {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  },
): Promise<User> {
  const { display_name, avatar_url, bio } = updates;

  const result = await pool.query(
    `UPDATE users 
     SET display_name = COALESCE($2, display_name),
         avatar_url = COALESCE($3, avatar_url),
         bio = COALESCE($4, bio),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, display_name, avatar_url, bio],
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
}

/**
 * Update last login
 */
export async function updateLastLogin(id: string): Promise<void> {
  await pool.query(
    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
    [id],
  );
}

export default {
  createUser,
  findUserById,
  findUserByUsername,
  findUserByEmail,
  validateCredentials,
  updateUserProfile,
  updateLastLogin,
};
