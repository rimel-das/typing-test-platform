import pool from "../config/database";

/**
 * Typing Test Model/Service
 * Handles all typing test record operations
 */

export interface TypingTest {
  id: string;
  user_id: string;
  duration: number;
  difficulty: string;
  language: string;
  mode: string;
  test_type: string;
  wpm: number;
  accuracy: number;
  raw_wpm: number;
  characters_typed: number;
  correct_characters: number;
  incorrect_characters: number;
  extra_characters: number;
  missed_characters: number;
  consistency: number | null;
  race_id: string | null;
  position_in_race: number | null;
  input_history: any;
  created_at: Date;
  completed_at: Date | null;
  duration_actual: number | null;
}

export interface CreateTestInput {
  user_id: string;
  duration: number;
  difficulty: string;
  language?: string;
  mode?: string;
  test_type?: string;
  wpm: number;
  accuracy: number;
  raw_wpm: number;
  characters_typed: number;
  correct_characters: number;
  incorrect_characters: number;
  extra_characters: number;
  missed_characters: number;
  consistency?: number;
  input_history?: any;
  duration_actual?: number;
}

/**
 * Create new typing test record
 */
export async function createTypingTest(
  input: CreateTestInput,
): Promise<TypingTest> {
  const {
    user_id,
    duration,
    difficulty,
    language = "english",
    mode = "time",
    test_type = "normal",
    wpm,
    accuracy,
    raw_wpm,
    characters_typed,
    correct_characters,
    incorrect_characters,
    extra_characters,
    missed_characters,
    consistency,
    input_history,
    duration_actual,
  } = input;

  const result = await pool.query(
    `INSERT INTO typing_tests (
      user_id, duration, difficulty, language, mode, test_type,
      wpm, accuracy, raw_wpm, characters_typed, correct_characters,
      incorrect_characters, extra_characters, missed_characters,
      consistency, input_history, completed_at, duration_actual
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, $17)
    RETURNING *`,
    [
      user_id,
      duration,
      difficulty,
      language,
      mode,
      test_type,
      wpm,
      accuracy,
      raw_wpm,
      characters_typed,
      correct_characters,
      incorrect_characters,
      extra_characters,
      missed_characters,
      consistency,
      input_history,
      duration_actual,
    ],
  );

  return result.rows[0];
}

/**
 * Get user's test history
 */
export async function getUserTestHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<TypingTest[]> {
  const result = await pool.query(
    `SELECT * FROM typing_tests 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
}

/**
 * Get user's tests by difficulty
 */
export async function getUserTestsByDifficulty(
  userId: string,
  difficulty: string,
): Promise<TypingTest[]> {
  const result = await pool.query(
    `SELECT * FROM typing_tests 
     WHERE user_id = $1 AND difficulty = $2 
     ORDER BY created_at DESC`,
    [userId, difficulty],
  );

  return result.rows;
}

/**
 * Get best WPM test for user
 */
export async function getBestWpmTest(
  userId: string,
): Promise<TypingTest | null> {
  const result = await pool.query(
    `SELECT * FROM typing_tests 
     WHERE user_id = $1 
     ORDER BY wpm DESC 
     LIMIT 1`,
    [userId],
  );

  return result.rows[0] || null;
}

/**
 * Get recent tests for dashboard
 */
export async function getRecentTests(
  userId: string,
  days: number = 30,
): Promise<TypingTest[]> {
  const result = await pool.query(
    `SELECT * FROM typing_tests 
     WHERE user_id = $1 
     AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 day' * $2
     ORDER BY created_at DESC`,
    [userId, days],
  );

  return result.rows;
}

export default {
  createTypingTest,
  getUserTestHistory,
  getUserTestsByDifficulty,
  getBestWpmTest,
  getRecentTests,
};
