import jwt from "jsonwebtoken";
import config from "../config";
import { logger } from "./logger";

/**
 * JWT Token Management
 * Handles token generation, verification, and refresh
 * Production-grade error discrimination for proper HTTP semantics
 */

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Custom JWT error type for error discrimination
 * Enables proper HTTP status code mapping and diagnostics
 */
export class JWTError extends Error {
  constructor(
    public readonly code: "EXPIRED" | "MALFORMED" | "INVALID" | "UNKNOWN",
    message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, JWTError.prototype);
  }

  /**
   * Get appropriate HTTP status code
   * Following HTTP semantic standards:
   * - 401: Authentication invalid/expired (client should re-authenticate)
   * - 403: Authorization failed (client authenticated but lacks permission)
   */
  getStatusCode(): number {
    // All JWT errors are authentication failures (401), not authorization failures (403)
    return 401;
  }

  /**
   * Client-facing error message
   */
  getClientMessage(): string {
    switch (this.code) {
      case "EXPIRED":
        return "Token has expired. Please log in again.";
      case "MALFORMED":
        return "Invalid token format.";
      case "INVALID":
        return "Invalid or tampered token.";
      default:
        return "Authentication failed.";
    }
  }
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  const secret = Buffer.from(config.jwt.secret);
  // @ts-ignore - jsonwebtoken types have an issue with Secret typing
  return jwt.sign(payload, secret, {
    expiresIn: config.jwt.expiry,
    algorithm: "HS256" as const,
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId: string): string {
  const secret = Buffer.from(config.jwt.secret);
  // @ts-ignore - jsonwebtoken types have an issue with Secret typing
  return jwt.sign({ userId }, secret, {
    expiresIn: config.jwt.refreshExpiry,
    algorithm: "HS256" as const,
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload.userId),
  };
}

/**
 * Verify and decode JWT token
 * Discriminates between error types for proper error handling
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Validate required fields
    if (!decoded.userId || !decoded.username || !decoded.email) {
      logger.warn("Token missing required fields", {
        token: token.substring(0, 20) + "...",
      });
      throw new JWTError("MALFORMED", "Token missing required fields");
    }

    return decoded;
  } catch (error) {
    // Discriminate between error types
    if (error instanceof JWTError) {
      throw error; // Re-throw our custom error
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.debug("Token expired", {
        expiredAt: error.expiredAt?.toISOString(),
      });
      throw new JWTError(
        "EXPIRED",
        `Token expired at ${error.expiredAt?.toISOString()}`,
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("JWT verification failed", {
        message: error.message,
      });

      if (error.message.includes("invalid signature")) {
        throw new JWTError("INVALID", "Token signature verification failed");
      }

      if (error.message.includes("invalid token")) {
        throw new JWTError("MALFORMED", "Invalid token format");
      }

      throw new JWTError("INVALID", error.message);
    }

    // Unexpected error
    logger.error("Unexpected error during token verification", error as Error);
    throw new JWTError("UNKNOWN", "Token verification failed");
  }
}

/**
 * Verify refresh token and return userId
 * Discriminates error types for diagnostics
 */
export function verifyRefreshToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId?: string };

    if (!decoded.userId) {
      logger.warn("Refresh token missing userId");
      throw new JWTError("MALFORMED", "Refresh token missing userId");
    }

    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof JWTError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.debug("Refresh token expired", {
        expiredAt: error.expiredAt?.toISOString(),
      });
      throw new JWTError("EXPIRED", "Refresh token expired");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("Refresh token verification failed", {
        message: error.message,
      });
      throw new JWTError("INVALID", "Invalid refresh token");
    }

    logger.error(
      "Unexpected error during refresh token verification",
      error as Error,
    );
    throw new JWTError("UNKNOWN", "Refresh token verification failed");
  }
}

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyRefreshToken,
};
