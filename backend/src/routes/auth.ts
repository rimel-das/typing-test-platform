import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

/**
 * Authentication Routes
 */

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 32 })
      .withMessage("Username must be 3-32 characters"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  authController.register,
);

/**
 * POST /api/auth/login
 * Login a user
 */
router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login,
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", authenticateToken, authController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  "/profile",
  authenticateToken,
  [
    body("display_name").optional().trim().isLength({ max: 100 }),
    body("avatar_url").optional().isURL(),
    body("bio").optional().trim().isLength({ max: 500 }),
  ],
  authController.updateProfile,
);

export default router;
