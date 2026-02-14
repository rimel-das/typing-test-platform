import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTError } from "../utils/jwt";
import { logger } from "../utils/logger";

/**
 * Authentication Middleware
 * Verifies JWT token and adds user info to request
 * Production-grade: Proper HTTP status codes and error discrimination
 */

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
  };
  requestId?: string;
}

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Authentication middleware (REQUIRED)
 * Checks for valid JWT token in Authorization header
 * Returns 401 on invalid/missing credentials (HTTP semantic correct)
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];
  const token = extractToken(authHeader);

  // No token provided
  if (!token) {
    logger.warn("Missing authentication token", {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
    });

    res.status(401).json({
      error: "Missing or invalid Authorization header",
      code: "MISSING_TOKEN",
    });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    req.requestId = `${payload.userId}-${Date.now()}`;

    logger.debug("Token verified", {
      userId: payload.userId,
      endpoint: req.path,
    });

    next();
  } catch (error) {
    // Handle JWT errors with proper HTTP semantics
    if (error instanceof JWTError) {
      logger.warn("Authentication failed", {
        code: error.code,
        message: error.message,
        endpoint: req.path,
        ip: req.ip,
      });

      // All JWT errors return 401 (Unauthorized), not 403 (Forbidden)
      // 401 = Authentication invalid
      // 403 = Authentication valid but authorization failed (resource-level)
      res.status(error.getStatusCode()).json({
        error: error.getClientMessage(),
        code: error.code,
      });
      return;
    }

    // Unexpected error
    logger.error("Unexpected authentication error", error as Error, {
      endpoint: req.path,
      ip: req.ip,
    });

    res.status(500).json({
      error: "Authentication service error",
      code: "AUTH_ERROR",
    });
  }
}

/**
 * Optional authentication middleware
 * Doesn't fail if token is missing, but validates if present
 * Useful for endpoints that support both authenticated and unauthenticated access
 */
export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];
  const token = extractToken(authHeader);

  if (!token) {
    // No token provided - that's ok, continue without user context
    next();
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    req.requestId = `${payload.userId}-${Date.now()}`;

    logger.debug("Optional token verified", {
      userId: payload.userId,
    });
  } catch (error) {
    // Token provided but invalid - log it but don't fail
    if (error instanceof JWTError) {
      logger.debug("Optional authentication failed", {
        code: error.code,
        endpoint: req.path,
      });
    } else {
      logger.warn("Unexpected error in optional auth", error as Error);
    }
    // Fall through - continue without user context
  }

  next();
}

export default {
  authenticateToken,
  optionalAuth,
};
