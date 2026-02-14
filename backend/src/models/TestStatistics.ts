import pool from "../config/database";

/**
 * Test Statistics Model/Service
 * Handles aggregated user statistics
 */

export interface TestStatistics {
  user_id: string;
  total_tests: number;
  total_time_typing: number;
  avg_wpm: number;
  max_wpm: number;
  min_wpm: number;
  avg_accuracy: number;
  avg_consistency: number;
  tests_easy: number;
  tests_normal: number;
  tests_hard: number;
  current_streak: number;
  longest_streak: number;
  updated_at: Date;
}

/**
 * Get user statistics
 */
export async function getUserStatistics(
  userId: string,
): Promise<TestStatistics | null> {
  const result = await pool.query(
    "SELECT * FROM test_statistics WHERE user_id = $1",
    [userId],
  );

  return result.rows[0] || null;
}

/**
 * Initialize user statistics
 */
export async function initializeStatistics(
  userId: string,
): Promise<TestStatistics> {
  const result = await pool.query(
    `INSERT INTO test_statistics (user_id) 
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING *`,
    [userId],
  );

  return result.rows[0];
}

/**
 * Recalculate statistics for a user from their tests
 * Run after completing a new test
 */
export async function recalculateStatistics(
  userId: string,
): Promise<TestStatistics> {
  // Get all tests for user
  const testsResult = await pool.query(
    `SELECT 
      COUNT(*) as total_tests,
      SUM(CASE WHEN difficulty = 'easy' THEN 1 ELSE 0 END) as tests_easy,
      SUM(CASE WHEN difficulty = 'normal' THEN 1 ELSE 0 END) as tests_normal,
      SUM(CASE WHEN difficulty = 'hard' THEN 1 ELSE 0 END) as tests_hard,
      SUM(duration_actual) as total_time_typing,
      ROUND(AVG(wpm)::numeric, 2) as avg_wpm,
      MAX(wpm) as max_wpm,
      MIN(wpm) as min_wpm,
      ROUND(AVG(accuracy)::numeric, 2) as avg_accuracy,
      ROUND(AVG(consistency)::numeric, 2) as avg_consistency
     FROM typing_tests 
     WHERE user_id = $1`,
    [userId],
  );

  const stats = testsResult.rows[0];

  // Update statistics
  const result = await pool.query(
    `UPDATE test_statistics 
     SET total_tests = $2,
         total_time_typing = COALESCE($3, 0),
         avg_wpm = COALESCE($4, 0),
         max_wpm = COALESCE($5, 0),
         min_wpm = COALESCE($6, 0),
         avg_accuracy = COALESCE($7, 0),
         avg_consistency = COALESCE($8, 0),
         tests_easy = COALESCE($9, 0),
         tests_normal = COALESCE($10, 0),
         tests_hard = COALESCE($11, 0),
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING *`,
    [
      userId,
      stats.total_tests,
      stats.total_time_typing,
      stats.avg_wpm,
      stats.max_wpm,
      stats.min_wpm,
      stats.avg_accuracy,
      stats.avg_consistency,
      stats.tests_easy,
      stats.tests_normal,
      stats.tests_hard,
    ],
  );

  return result.rows[0];
}

export default {
  getUserStatistics,
  initializeStatistics,
  recalculateStatistics,
};
