import { Router } from "express";
import { body } from "express-validator";
import * as testController from "../controllers/testController";
import { authenticateToken } from "../middleware/auth";

/**
 * Typing Test Routes
 */

const router = Router();

/**
 * POST /api/tests/submit
 * Submit a completed typing test
 */
router.post(
  "/submit",
  authenticateToken,
  [
    body("originalText").notEmpty().withMessage("Original text is required"),
    body("typedText").notEmpty().withMessage("Typed text is required"),
    body("duration")
      .isInt({ min: 15, max: 3600 })
      .withMessage("Duration must be between 15 and 3600 seconds"),
    body("difficulty")
      .isIn(["easy", "normal", "hard"])
      .withMessage("Invalid difficulty"),
    body("language").optional().trim(),
    body("mode").optional().isIn(["time", "words", "quote", "zen"]),
    body("testType").optional().isIn(["normal", "punctuation", "numbers"]),
  ],
  testController.submitTest,
);

/**
 * GET /api/tests/history
 * Get user's test history
 */
router.get("/history", authenticateToken, testController.getTestHistory);

/**
 * GET /api/tests/statistics
 * Get user's typing statistics
 */
router.get("/statistics", authenticateToken, testController.getStatistics);

/**
 * GET /api/tests/best
 * Get user's best test
 */
router.get("/best", authenticateToken, testController.getBestTest);

/**
 * GET /api/tests/:testId
 * Get specific test details
 */
router.get("/:testId", authenticateToken, testController.getTestById);

export default router;
