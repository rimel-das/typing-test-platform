import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import * as TestModel from "../models/TypingTest";
import * as StatsModel from "../models/TestStatistics";
import { validationResult } from "express-validator";
import { calculateTestMetrics } from "../utils/typingCalculations";

/**
 * Typing Test Controller
 * Handles test creation, retrieval, and statistics
 */

/**
 * Submit typing test result
 */
export async function submitTest(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      originalText,
      typedText,
      duration,
      difficulty,
      language = "english",
      mode = "time",
      testType = "normal",
      inputHistory,
      durationActual,
    } = req.body;

    // Validate inputs
    if (!originalText || !typedText || !duration) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Check for suspicious activity
    if (durationActual && durationActual > duration * 1.5) {
      res.status(400).json({ error: "Test duration exceeded limits" });
      return;
    }

    // Calculate metrics
    const metrics = calculateTestMetrics(
      originalText,
      typedText,
      durationActual || duration,
      inputHistory,
    );

    // Check for cheating patterns
    if (metrics.anomalies?.suspiciousPaste || metrics.anomalies?.unusualSpeed) {
      console.warn(`Suspicious activity for user ${req.user.userId}`);
      // Still save but flag it
    }

    // Create test record
    const test = await TestModel.createTypingTest({
      user_id: req.user.userId,
      duration,
      difficulty,
      language,
      mode,
      test_type: testType,
      wpm: metrics.wpm,
      raw_wpm: metrics.rawWpm,
      accuracy: metrics.accuracy,
      characters_typed: typedText.length,
      correct_characters: metrics.characters.correct,
      incorrect_characters: metrics.characters.incorrect,
      extra_characters: metrics.characters.extra,
      missed_characters: metrics.characters.missed,
      consistency: metrics.consistency,
      input_history: inputHistory || null,
      duration_actual: durationActual,
    });

    // Recalculate user statistics
    await StatsModel.recalculateStatistics(req.user.userId);

    res.status(201).json({
      message: "Test submitted successfully",
      test: {
        id: test.id,
        wpm: test.wpm,
        accuracy: test.accuracy,
        consistency: test.consistency,
        created_at: test.created_at,
      },
    });
  } catch (error: any) {
    console.error("Submit test error:", error);
    res.status(500).json({ error: "Failed to submit test" });
  }
}

/**
 * Get user's test history
 */
export async function getTestHistory(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const tests = await TestModel.getUserTestHistory(
      req.user.userId,
      limit,
      offset,
    );

    res.status(200).json({
      tests: tests.map((t) => ({
        id: t.id,
        wpm: t.wpm,
        accuracy: t.accuracy,
        consistency: t.consistency,
        difficulty: t.difficulty,
        duration: t.duration,
        created_at: t.created_at,
      })),
      count: tests.length,
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to get test history" });
  }
}

/**
 * Get user statistics
 */
export async function getStatistics(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const userId = req.params.userId || req.user.userId;

    const stats = await StatsModel.getUserStatistics(userId);

    if (!stats) {
      res.status(404).json({ error: "Statistics not found" });
      return;
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
}

/**
 * Get user's best test
 */
export async function getBestTest(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const best = await TestModel.getBestWpmTest(req.user.userId);

    if (!best) {
      res.status(404).json({ error: "No tests found" });
      return;
    }

    res.status(200).json({
      wpm: best.wpm,
      accuracy: best.accuracy,
      consistency: best.consistency,
      difficulty: best.difficulty,
      created_at: best.created_at,
    });
  } catch (error) {
    console.error("Get best test error:", error);
    res.status(500).json({ error: "Failed to get best test" });
  }
}

/**
 * Get test by ID
 */
export async function getTestById(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { testId: _testId } = req.params;

    // In production, would fetch from DB
    // For now, this is a placeholder

    res.status(200).json({
      message: "Test details retrieved",
    });
  } catch (error) {
    console.error("Get test error:", error);
    res.status(500).json({ error: "Failed to get test" });
  }
}

export default {
  submitTest,
  getTestHistory,
  getStatistics,
  getBestTest,
  getTestById,
};
