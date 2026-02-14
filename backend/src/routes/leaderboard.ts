import { Router } from "express";
import * as leaderboardController from "../controllers/leaderboardController";
import { optionalAuth } from "../middleware/auth";

/**
 * Leaderboard Routes
 */

const router = Router();

/**
 * GET /api/leaderboard
 * Get global leaderboard
 */
router.get("/", optionalAuth, leaderboardController.getGlobalLeaderboard);

/**
 * GET /api/leaderboard/:userId/rank
 * Get user's rank
 */
router.get("/:userId/rank", optionalAuth, leaderboardController.getUserRank);

export default router;
