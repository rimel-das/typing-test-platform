import pool from "../config/database";
import { Response } from "express";

/**
 * Leaderboard Controller
 * Handles leaderboard queries and rankings
 */

/**
 * Get global leaderboard
 */
export async function getGlobalLeaderboard(
  req: any,
  res: Response,
): Promise<void> {
  try {
    const period = req.query.period || "all_time";
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY wpm DESC) as rank,
        user_id,
        username,
        wpm,
        accuracy,
        tests_completed,
        avg_consistency
       FROM leaderboard
       WHERE period = $1
       ORDER BY wpm DESC
       LIMIT $2 OFFSET $3`,
      [period, limit, offset],
    );

    res.status(200).json({
      leaderboard: result.rows,
      period,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
}

/**
 * Get user's leaderboard rank
 */
export async function getUserRank(req: any, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const period = req.query.period || "all_time";

    const result = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY wpm DESC) as rank,
        user_id,
        username,
        wpm,
        tests_completed
       FROM leaderboard
       WHERE period = $1
       AND user_id = $2`,
      [period, userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not ranked" });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get rank error:", error);
    res.status(500).json({ error: "Failed to get rank" });
  }
}

export default {
  getGlobalLeaderboard,
  getUserRank,
};
