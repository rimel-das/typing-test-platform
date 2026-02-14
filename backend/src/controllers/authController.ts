import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { validationResult } from "express-validator";
import * as UserModel from "../models/User";
import * as UserStats from "../models/TestStatistics";
import { generateTokenPair } from "../utils/jwt";

/**
 * Authentication Controller
 * Handles user registration, login, and token refresh
 */

/**
 * Register new user
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, email, password, confirmPassword } = req.body;

    // Validate password match
    if (password !== confirmPassword) {
      res.status(400).json({ error: "Passwords do not match" });
      return;
    }

    // Create user
    const user = await UserModel.createUser({ username, email, password });

    // Initialize statistics
    await UserStats.initializeStatistics(user.id);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ...tokens,
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.message.includes("already exists")) {
      res.status(409).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Registration failed" });
  }
}

/**
 * Login user
 */
export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, password } = req.body;

    // Validate credentials
    const user = await UserModel.validateCredentials(username, password);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await UserModel.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { display_name, avatar_url, bio } = req.body;

    const user = await UserModel.updateUserProfile(req.user.userId, {
      display_name,
      avatar_url,
      bio,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);

    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(500).json({ error: "Failed to update profile" });
  }
}

export default {
  register,
  login,
  getCurrentUser,
  updateProfile,
};
